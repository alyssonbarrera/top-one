import { Order as PrismaOrder } from '@prisma/client'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Order } from '@/domain/order/enterprise/entities/order'

export class PrismaOrderMapper {
  static toDomain(order: PrismaOrder): Order {
    return Order.create(
      {
        status: order.status,
        vendorId: new UniqueEntityID(order.vendorId),
        clientId: new UniqueEntityID(order.clientId),
        createdAt: order.createdAt,
        totalPrice: order.totalPrice,
        updatedAt: order.updatedAt ?? null,
      },
      new UniqueEntityID(order.id),
    )
  }

  static toPrisma(order: Order): PrismaOrder {
    return {
      id: order.id.toString(),
      status: order.status,
      vendorId: order.vendorId.toString(),
      clientId: order.clientId.toString(),
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt ?? null,
    }
  }
}
