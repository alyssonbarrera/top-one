import { Cart as PrismaCart } from '@prisma/client'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Cart } from '@/domain/cart/enterprise/entities/cart'

export class PrismaCartMapper {
  static toDomain(cart: PrismaCart): Cart {
    return Cart.create(
      {
        clientId: new UniqueEntityID(cart.clientId),
      },
      new UniqueEntityID(cart.id),
    )
  }

  static toPrisma(cart: Cart): PrismaCart {
    return {
      id: cart.id.toString(),
      clientId: cart.clientId.toString(),
    }
  }
}
