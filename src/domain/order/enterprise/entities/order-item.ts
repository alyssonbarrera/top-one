import Decimal from 'decimal.js'

import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface OrderItemProps {
  orderId: UniqueEntityID
  productId: UniqueEntityID
  quantity: number
  price: Decimal
}

export class OrderItem extends Entity<OrderItemProps> {
  get orderId() {
    return this.props.orderId
  }

  set orderId(orderId: UniqueEntityID) {
    this.props.orderId = orderId
  }

  get productId() {
    return this.props.productId
  }

  set productId(productId: UniqueEntityID) {
    this.props.productId = productId
  }

  get quantity() {
    return this.props.quantity
  }

  set quantity(quantity: number) {
    this.props.quantity = quantity
  }

  get price() {
    return this.props.price
  }

  set price(price: Decimal) {
    this.props.price = price
  }

  static create(props: OrderItemProps, id?: UniqueEntityID) {
    return new OrderItem(props, id)
  }
}
