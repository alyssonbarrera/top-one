import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface CartItemProps {
  quantity: number
  cartId: UniqueEntityID
  productId: UniqueEntityID
}

export class CartItem extends Entity<CartItemProps> {
  get quantity() {
    return this.props.quantity
  }

  set quantity(quantity: number) {
    this.props.quantity = quantity
  }

  get cartId() {
    return this.props.cartId
  }

  set cartId(cartId: UniqueEntityID) {
    this.props.cartId = cartId
  }

  get productId() {
    return this.props.productId
  }

  set productId(productId: UniqueEntityID) {
    this.props.productId = productId
  }

  static create(props: CartItemProps, id?: UniqueEntityID) {
    return new CartItem(props, id)
  }
}
