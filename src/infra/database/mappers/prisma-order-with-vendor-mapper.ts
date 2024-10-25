import { User as PrismaUser, Order as PrismaOrder } from '@prisma/client'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { OrderWithVendor } from '@/domain/order/enterprise/value-objects/order-with-vendor'

type PrismaOrderWithVendor = PrismaOrder & {
  vendor: Pick<PrismaUser, 'id' | 'name' | 'email'>
  client: Pick<PrismaUser, 'id' | 'name' | 'email'>
}

export class PrismaOrderWithVendorMapper {
  static toDomain(order: PrismaOrderWithVendor): OrderWithVendor {
    return OrderWithVendor.create({
      orderId: new UniqueEntityID(order.id),
      vendorId: new UniqueEntityID(order.vendorId),
      vendor: {
        id: new UniqueEntityID(order.vendor.id),
        name: order.vendor.name,
        email: order.vendor.email,
      },
      status: order.status,
      createdAt: order.createdAt,
      totalPrice: order.totalPrice,
      clientId: new UniqueEntityID(order.clientId),
      updatedAt: order.updatedAt ?? null,
    })
  }
}
