import { Injectable } from '@nestjs/common'

import Decimal from 'decimal.js'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { OrderStatus } from '@/core/enums/order-status'

import { Order } from '@/domain/order/enterprise/entities/order'
import { OrderItem } from '@/domain/order/enterprise/entities/order-item'
import { Product } from '@/domain/product/enterprise/entities/product'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { calculateItemPrice } from '@/utils/calculate-item-price'

import { Item } from '../create-order-use-case'

type ProcessOrderItemsProps = {
  items: Item[]
  order?: Order
  orderItems?: OrderItem[]
  clientId: string
  products: Product[]
  currentUser: UserPayload
}

type ProcessItemProps = {
  items: Item[]
  products: Product[]
  orderItems?: OrderItem[]
  notFoundProducts: string[]
  orderOrderId: UniqueEntityID
  itemsPrice: number[]
  updatedOrderItems: OrderItem[]
  deletedOrderItems: OrderItem[]
}

type CreateOrderProps = {
  orderId: UniqueEntityID
  clientId: string
  currentUser: UserPayload
  totalPrice: Decimal
}

@Injectable()
export class OrderProcessor {
  public processOrderItems({
    items,
    order,
    products,
    clientId,
    orderItems,
    currentUser,
  }: ProcessOrderItemsProps) {
    const itemsPrice: number[] = []
    const notFoundProducts: string[] = []
    const updatedOrderItems: OrderItem[] = []
    const deletedOrderItems: OrderItem[] = []
    const orderOrderId = order?.id ?? new UniqueEntityID()

    let totalPrice = order?.totalPrice ?? new Decimal(0)

    this.processItem({
      items,
      products,
      orderItems,
      notFoundProducts,
      orderOrderId,
      itemsPrice,
      updatedOrderItems,
      deletedOrderItems,
    })

    const itemsTotalPrice = itemsPrice.reduce((acc, price) => acc + price, 0)
    totalPrice = new Decimal(itemsTotalPrice)

    if (!order) {
      order = this.createOrder({
        clientId,
        totalPrice,
        currentUser,
        orderId: orderOrderId,
      })
    }

    order.totalPrice = totalPrice

    return {
      order,
      orderItems: updatedOrderItems,
      orderItemsToDelete: deletedOrderItems,
      notFoundProducts,
    }
  }

  private processItem({
    items,
    products,
    orderItems,
    itemsPrice,
    orderOrderId,
    notFoundProducts,
    updatedOrderItems,
    deletedOrderItems,
  }: ProcessItemProps) {
    items.forEach((item) => {
      const product = this.findProduct(item.productId, products)

      if (!product) {
        return notFoundProducts.push(item.productId)
      }

      const existingOrderItem =
        orderItems &&
        orderItems.find(
          (orderItem) =>
            orderItem.productId.equals(product.id) &&
            orderItem.orderId.equals(orderOrderId),
        )

      if (existingOrderItem && item.quantity === 0) {
        deletedOrderItems.push(existingOrderItem)
        return
      }

      const itemPrice =
        existingOrderItem?.price ?? this.calculateItemPrice(item, product)

      itemsPrice.push(itemPrice.toNumber() * item.quantity)

      const orderItem =
        existingOrderItem ?? this.createOrderItem(item, product, orderOrderId)

      updatedOrderItems.push(orderItem)
    })
  }

  private findProduct(
    productId: string,
    products: Product[],
  ): Product | undefined {
    return products.find((product) =>
      product.id.equals(new UniqueEntityID(productId)),
    )
  }

  private calculateItemPrice(item: Item, product: Product): Decimal {
    return calculateItemPrice({
      price: product.price,
      discount: product.discount,
    })
  }

  private createOrderItem(
    item: Item,
    product: Product,
    orderId: UniqueEntityID,
  ): OrderItem {
    return OrderItem.create({
      productId: product.id,
      quantity: item.quantity,
      price: this.calculateItemPrice(item, product),
      orderId,
    })
  }

  private createOrder({
    orderId,
    clientId,
    totalPrice,
    currentUser,
  }: CreateOrderProps): Order {
    return Order.create(
      {
        status: OrderStatus.PROCESSING,
        clientId: new UniqueEntityID(clientId),
        vendorId: new UniqueEntityID(currentUser.sub),
        totalPrice,
      },
      orderId,
    )
  }
}
