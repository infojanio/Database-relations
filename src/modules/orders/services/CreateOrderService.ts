import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    //
    const customerExists = await this.customersRepository.findById(customer_id);

    if (!customerExists) {
      throw new AppError('Não foi encontrado nenhum cliente com esse id');
    }

    // Pega todos os id dos produtos
    const existentProducts = await this.productsRepository.findAllById(
      products,
    );

    if (!existentProducts.length) {
      throw new AppError('Não foi encontrado produto com este id');
    }
    // mapea todos os produtos por id
    const existentProductsId = existentProducts.map(product => product.id);

    // Filtra pelos produtos inexistentes
    const checkInexistentProducts = products.filter(
      product => !existentProductsId.includes(product.id),
    );

    if (checkInexistentProducts.length) {
      throw new AppError(
        `Produto não encontrado ${checkInexistentProducts[0].id}`, // retorna o primeiro produto inexistente
      );
    }
    // Verificar quantidade insuficiente
    const findProductWithNoQuantityAvailable = products.filter(
      product =>
        existentProducts.filter(p => p.id === product.id)[0].quantity <
        product.quantity,
    );

    if (findProductWithNoQuantityAvailable.length) {
      throw new AppError(`
      A quantidade ${findProductWithNoQuantityAvailable[0].quantity} não está disponível para ${findProductWithNoQuantityAvailable[0].id}`);
    }

    // formatação dos produtos pra salvar no banco de dados
    const serializedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: existentProducts.filter(p => p.id === product.id)[0].price,
    }));

    const order = await this.ordersRepository.create({
      customer: customerExists,
      products: serializedProducts,
    });

    const { order_products } = order; // pra garantir que todos pedidos salvos estarão no order

    const orderedProductsQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity:
        existentProducts.filter(p => p.id === product.product_id)[0].quantity -
        product.quantity,
    }));

    await this.productsRepository.updateQuantity(orderedProductsQuantity);
    return order;
  }
}

export default CreateOrderService;
