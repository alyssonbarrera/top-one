import { Cart } from '@/domain/cart/enterprise/entities/cart'

export class CartPresenter {
  static toHTTP(cart: Cart) {
    return {
      id: cart.id.toString(),
      clientId: cart.clientId.toString(),
    }
  }
}
