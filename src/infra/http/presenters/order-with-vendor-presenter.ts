import { OrderWithVendor } from '@/domain/order/enterprise/value-objects/order-with-vendor'

export class OrderWithVendorPresenter {
  static toHTTP(order: OrderWithVendor) {
    return {
      id: order.orderId.toString(),
      status: order.status,
      vendor: {
        id: order.vendor.id.toString(),
        name: order.vendor.name,
        email: order.vendor.email,
      },
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      totalPrice: order.totalPrice.toNumber(),
    }
  }
}
