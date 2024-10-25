import { CartItem as PrismaCartItem } from '@prisma/client'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { CartItem } from '@/domain/cart/enterprise/entities/cart-item'

export class PrismaCartItemMapper {
  static toDomain(cartItem: PrismaCartItem): CartItem {
    return CartItem.create(
      {
        cartId: new UniqueEntityID(cartItem.cartId),
        productId: new UniqueEntityID(cartItem.productId),
        quantity: cartItem.quantity,
      },
      new UniqueEntityID(cartItem.id),
    )
  }

  static toPrisma(cartItem: CartItem): PrismaCartItem {
    return {
      id: cartItem.id.toString(),
      cartId: cartItem.cartId.toString(),
      productId: cartItem.productId.toString(),
      quantity: cartItem.quantity,
    }
  }

  static toPrismaWithoutCartId(
    cartItem: CartItem,
  ): Omit<PrismaCartItem, 'cartId'> {
    return {
      id: cartItem.id.toString(),
      productId: cartItem.productId.toString(),
      quantity: cartItem.quantity,
    }
  }
}
