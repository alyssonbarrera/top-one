import { OrderItem as PrismaOrderItem } from '@prisma/client'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { OrderItem } from '@/domain/order/enterprise/entities/order-item'

export class PrismaOrderItemsMapper {
  static toDomain(orderItem: PrismaOrderItem): OrderItem {
    return OrderItem.create(
      {
        orderId: new UniqueEntityID(orderItem.orderId),
        productId: new UniqueEntityID(orderItem.productId),
        quantity: orderItem.quantity,
        price: orderItem.price,
      },
      new UniqueEntityID(orderItem.id),
    )
  }

  static toPrisma(orderItem: OrderItem): PrismaOrderItem {
    return {
      id: orderItem.id.toString(),
      orderId: orderItem.orderId.toString(),
      productId: orderItem.productId.toString(),
      quantity: orderItem.quantity,
      price: orderItem.price,
    }
  }

  static toPrismaWithoutOrderId(
    orderItem: OrderItem,
  ): Omit<PrismaOrderItem, 'orderId'> {
    return {
      id: orderItem.id.toString(),
      productId: orderItem.productId.toString(),
      quantity: orderItem.quantity,
      price: orderItem.price,
    }
  }
}
