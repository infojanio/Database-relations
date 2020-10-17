import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    // Retorna o pedido procurado
    const { id } = request.params;
    const findOrder = container.resolve(FindOrderService);
    const order = await findOrder.execute({
      id,
    });

    return response.json(order);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    // Pega o cliente que está comprando e o produto, pra salvar dentro dos pedidos, orders.
    const { customer_id, products } = request.body;

    const createOrder = container.resolve(CreateOrderService); // Instancia tudo com injeções de dependências
    const customer = await createOrder.execute({
      customer_id,
      products,
    });

    return response.json(customer);
  }
}
