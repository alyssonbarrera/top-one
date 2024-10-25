import { CartWithTotalPrice } from '@/domain/cart/enterprise/value-objects/cart-with-total-price'

export class CartWithTotalPricePresenter {
  static toHTTP(cart: CartWithTotalPrice) {
    return {
      id: cart.cartId.toString(),
      clientId: cart.clientId.toString(),
      totalPrice: cart.totalPrice,
    }
  }
}
