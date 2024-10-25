import { Cart as PrismaCart, CartItem as PrismaCartItem } from '@prisma/client'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { CartItem } from '@/domain/cart/enterprise/entities/cart-item'
import { CartWithProducts } from '@/domain/cart/enterprise/value-objects/cart-with-products'

type PrismaCartWithProducts = PrismaCart & {
  products: PrismaCartItem[]
}

export class PrismaCartWithProductsMapper {
  static toDomain(cart: PrismaCartWithProducts): CartWithProducts {
    return CartWithProducts.create({
      clientId: new UniqueEntityID(cart.clientId),
      products: cart.products.map((product) =>
        CartItem.create(
          {
            productId: new UniqueEntityID(product.productId),
            quantity: product.quantity,
            cartId: new UniqueEntityID(product.cartId),
          },
          new UniqueEntityID(product.id),
        ),
      ),
      cartId: new UniqueEntityID(cart.id),
    })
  }
}
