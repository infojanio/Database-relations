import {
  MigrationInterface,
  QueryRunner,
  TableColumn, // vamos criar uma coluna na tabela
  TableForeignKey, // vamos criar uma chave estrangeira
} from 'typeorm';

export default class AddCustomerIdOrders1602377304091
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'customer_id',
        type: 'uuid',
        isNullable: true, // caso o cliente exclua a conta, os dados permanecerão
      }),
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'OrdersCustomer', // vários pedidos para um cliente, ManyToOne
        columnNames: ['customer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: `SET NULL`,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('orders', 'OrdersCustomer');
    await queryRunner.dropColumn('orders', 'customer_id');
  }
}
