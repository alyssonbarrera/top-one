import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

import { CartProps } from '../entities/cart'

export interface CartWithTotalPriceProps extends Omit<CartProps, 'products'> {
  cartId: UniqueEntityID
  totalPrice: number
}

export class CartWithTotalPrice extends ValueObject<CartWithTotalPriceProps> {
  get clientId() {
    return this.props.clientId
  }

  get totalPrice() {
    return this.props.totalPrice
  }

  get cartId() {
    return this.props.cartId
  }

  public static create(props: CartWithTotalPriceProps) {
    return new CartWithTotalPrice(props)
  }
}
