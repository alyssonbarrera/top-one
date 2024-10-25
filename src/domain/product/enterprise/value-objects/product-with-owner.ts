import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'
import { Optional } from '@/core/types/optional'

import { ProductProps } from '../entities/product'

export interface ProductWithOwnerProps
  extends Optional<ProductProps, 'updatedAt'> {
  productId: UniqueEntityID
  ownerId: UniqueEntityID
  owner: {
    id: UniqueEntityID
    name: string
    email: string
  }
}

export class ProductWithOwner extends ValueObject<ProductWithOwnerProps> {
  get productId() {
    return this.props.productId
  }

  get ownerId() {
    return this.props.ownerId
  }

  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description
  }

  get price() {
    return this.props.price
  }

  get discount() {
    return this.props.discount
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get owner() {
    return this.props.owner
  }

  public static create(props: ProductWithOwnerProps) {
    return new ProductWithOwner(props)
  }
}
