import { Order } from '@/domain/order/enterprise/entities/order'

export class OrderPresenter {
  static toHTTP(order: Order) {
    return {
      id: order.id.toString(),
      status: order.status,
      vendorId: order.vendorId.toString(),
      clientId: order.clientId.toString(),
      totalPrice: order.totalPrice.toNumber(),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }
  }
}
