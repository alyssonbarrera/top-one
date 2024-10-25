import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

import { CartProps } from '../entities/cart'
import { CartItem } from '../entities/cart-item'

export interface CartWithProductsAndTotalPriceProps extends CartProps {
  cartId: UniqueEntityID
  products: CartItem[]
  totalPrice: number
}

export class CartWithProductsAndTotalPrice extends ValueObject<CartWithProductsAndTotalPriceProps> {
  get clientId() {
    return this.props.clientId
  }

  get products() {
    return this.props.products
  }

  set products(products: CartItem[]) {
    this.props.products = products
  }

  get totalPrice() {
    return this.props.totalPrice
  }

  get cartId() {
    return this.props.cartId
  }

  public static create(props: CartWithProductsAndTotalPriceProps) {
    return new CartWithProductsAndTotalPrice(props)
  }
}
