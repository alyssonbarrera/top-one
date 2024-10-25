import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'
import { Optional } from '@/core/types/optional'

import { OrderProps } from '../entities/order'

export interface OrderWithVendorAndClientProps
  extends Optional<OrderProps, 'updatedAt'> {
  orderId: UniqueEntityID
  vendorId: UniqueEntityID
  vendor: {
    id: UniqueEntityID
    name: string
    email: string
  }
  clientId: UniqueEntityID
  client: {
    id: UniqueEntityID
    name: string
    email: string
  }
}

export class OrderWithVendorAndClient extends ValueObject<OrderWithVendorAndClientProps> {
  get orderId() {
    return this.props.orderId
  }

  get vendorId() {
    return this.props.vendorId
  }

  get clientId() {
    return this.props.clientId
  }

  get vendor() {
    return this.props.vendor
  }

  get client() {
    return this.props.client
  }

  get status() {
    return this.props.status
  }

  get totalPrice() {
    return this.props.totalPrice
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  public static create(props: OrderWithVendorAndClientProps) {
    return new OrderWithVendorAndClient(props)
  }
}
