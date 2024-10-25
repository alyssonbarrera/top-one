import { CartWithProducts } from '@/domain/cart/enterprise/value-objects/cart-with-products'

export class CartWithProductsPresenter {
  static toHTTP(cart: CartWithProducts) {
    return {
      id: cart.cartId.toString(),
      clientId: cart.clientId.toString(),
      products: cart.products.map((product) => ({
        id: product.productId.toString(),
        quantity: product.quantity,
      })),
    }
  }
}
