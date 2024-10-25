import Decimal from 'decimal.js'

import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface ProductProps {
  name: string
  description: string
  price: Decimal
  discount: Decimal

  ownerId: UniqueEntityID

  createdAt: Date
  updatedAt: Date | null
}

export class Product extends Entity<ProductProps> {
  get name() {
    return this.props.name
  }

  set name(name: string) {
    this.props.name = name
  }

  get description() {
    return this.props.description
  }

  set description(description: string) {
    this.props.description = description
  }

  get price() {
    return this.props.price
  }

  set price(price: Decimal) {
    this.props.price = price
  }

  get discount() {
    return this.props.discount
  }

  set discount(discount: Decimal) {
    this.props.discount = discount
  }

  get ownerId() {
    return this.props.ownerId
  }

  set ownerId(ownerId: UniqueEntityID) {
    this.props.ownerId = ownerId
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
    props: Optional<ProductProps, 'discount' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    const product = new Product(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        discount: props.discount ?? new Decimal(0),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    )

    return product
  }
}
