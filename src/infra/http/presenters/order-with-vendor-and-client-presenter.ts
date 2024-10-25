import { OrderWithVendorAndClient } from '@/domain/order/enterprise/value-objects/order-with-vendor-and-client'

export class OrderWithVendorAndClientPresenter {
  static toHTTP(order: OrderWithVendorAndClient) {
    return {
      id: order.orderId.toString(),
      status: order.status,
      vendor: {
        id: order.vendor.id.toString(),
        name: order.vendor.name,
        email: order.vendor.email,
      },
      client: {
        id: order.client.id.toString(),
        name: order.client.name,
        email: order.client.email,
      },
      totalPrice: order.totalPrice.toNumber(),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }
  }
}
