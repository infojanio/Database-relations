import { getRepository, Repository, Entity } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';

@Entity('order_products')
class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    // TODO
    const order = this.ormRepository.create({
      customer,
      order_products: products, // order_products é um array de produtos definido no entity
    });
    await this.ormRepository.save(order);
    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    // TODO
    const order = this.ormRepository.findOne(id, {
      relations: ['order_products', 'customer'],
    });
    return order;
  }
}

export default OrdersRepository;
