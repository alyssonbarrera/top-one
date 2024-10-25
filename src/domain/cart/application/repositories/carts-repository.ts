import { Cart } from '../../enterprise/entities/cart'
import { CartItem } from '../../enterprise/entities/cart-item'
import { CartWithProducts } from '../../enterprise/value-objects/cart-with-products'

export abstract class CartsRepository {
  abstract save(cart: Cart): Promise<Cart>
  abstract saveWithProducts(cart: Cart, products: CartItem[]): Promise<Cart>

  abstract findById(id: string): Promise<Cart | null>
  abstract findByIdWithProducts(id: string): Promise<CartWithProducts | null>
  abstract findByClientId(userId: string): Promise<Cart | null>

  abstract findByClientIdWithProducts(
    userId: string,
  ): Promise<CartWithProducts | null>

  abstract delete(id: string): Promise<void>
  abstract deleteByClientId(userId: string): Promise<void>
}
