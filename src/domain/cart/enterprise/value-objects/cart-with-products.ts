import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

import { CartProps } from '../entities/cart'
import { CartItem } from '../entities/cart-item'

export interface CartWithProductsProps extends CartProps {
  cartId: UniqueEntityID
  products: CartItem[]
}

export class CartWithProducts extends ValueObject<CartWithProductsProps> {
  get clientId() {
    return this.props.clientId
  }

  get products() {
    return this.props.products
  }

  set products(products: CartItem[]) {
    this.props.products = products
  }

  get cartId() {
    return this.props.cartId
  }

  public static create(props: CartWithProductsProps) {
    return new CartWithProducts(props)
  }
}
