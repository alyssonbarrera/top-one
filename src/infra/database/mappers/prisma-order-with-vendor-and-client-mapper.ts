import { User as PrismaUser, Order as PrismaOrder } from '@prisma/client'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { OrderWithVendorAndClient } from '@/domain/order/enterprise/value-objects/order-with-vendor-and-client'

type PrismaOrderWithVendorAndClient = PrismaOrder & {
  vendor: Pick<PrismaUser, 'id' | 'name' | 'email'>
  client: Pick<PrismaUser, 'id' | 'name' | 'email'>
}

export class PrismaOrderWithVendorAndClientMapper {
  static toDomain(
    order: PrismaOrderWithVendorAndClient,
  ): OrderWithVendorAndClient {
    return OrderWithVendorAndClient.create({
      orderId: new UniqueEntityID(order.id),
      vendorId: new UniqueEntityID(order.vendorId),
      vendor: {
        id: new UniqueEntityID(order.vendor.id),
        name: order.vendor.name,
        email: order.vendor.email,
      },
      clientId: new UniqueEntityID(order.clientId),
      client: {
        id: new UniqueEntityID(order.client.id),
        name: order.client.name,
        email: order.client.email,
      },
      status: order.status,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt ?? null,
    })
  }
}
