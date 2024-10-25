import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

import { CartItem } from './cart-item'

export interface CartProps {
  clientId: UniqueEntityID
  products: CartItem[]
}

export class Cart extends Entity<CartProps> {
  get clientId() {
    return this.props.clientId
  }

  set clientId(value: UniqueEntityID) {
    this.props.clientId = value
  }

  get products() {
    return this.props.products
  }

  set products(value: CartItem[]) {
    this.props.products = value
  }

  static create(props: Optional<CartProps, 'products'>, id?: UniqueEntityID) {
    const cart = new Cart(
      {
        ...props,
        products: props.products ?? [],
      },
      id,
    )

    return cart
  }
}
