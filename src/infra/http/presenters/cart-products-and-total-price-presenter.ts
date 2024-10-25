import { CartWithProductsAndTotalPrice } from '@/domain/cart/enterprise/value-objects/cart-with-products-and-total-price'

export class CartWithProductsAndTotalPricePresenter {
  static toHTTP(cart: CartWithProductsAndTotalPrice) {
    return {
      id: cart.cartId.toString(),
      clientId: cart.clientId.toString(),
      products: cart.products.map((product) => ({
        id: product.productId.toString(),
        quantity: product.quantity,
      })),
      totalPrice: cart.totalPrice,
    }
  }
}
