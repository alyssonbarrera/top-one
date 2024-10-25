import Decimal from 'decimal.js'

import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { OrderStatus } from '@/core/enums/order-status'
import { Optional } from '@/core/types/optional'

import { OrderCreatedEvent } from '../events/order-status-updated-event'

export interface OrderProps {
  clientId: UniqueEntityID
  vendorId: UniqueEntityID
  status: keyof typeof OrderStatus
  totalPrice: Decimal
  createdAt: Date
  updatedAt: Date | null
}

export class Order extends AggregateRoot<OrderProps> {
  get clientId() {
    return this.props.clientId
  }

  set clientId(clientId: UniqueEntityID) {
    this.props.clientId = clientId
  }

  get status() {
    return this.props.status
  }

  set status(status: keyof typeof OrderStatus) {
    this.props.status = status
  }

  get vendorId() {
    return this.props.vendorId
  }

  set vendorId(vendorId: UniqueEntityID) {
    this.props.vendorId = vendorId
  }

  get totalPrice() {
    return this.props.totalPrice
  }

  set totalPrice(totalPrice: Decimal) {
    this.props.totalPrice = totalPrice
  }

  get createdAt() {
    return this.props.createdAt
  }

  set createdAt(createdAt: Date) {
    this.props.createdAt = createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set updatedAt(updatedAt: Date | null) {
    this.props.updatedAt = updatedAt
  }

  static create(
    props: Optional<OrderProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    const order = new Order(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    )

    return order
  }

  static updateStatus(order: Order, status: OrderStatus) {
    order.status = status

    order.addDomainEvent(new OrderCreatedEvent(order))
  }
}
