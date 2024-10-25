import { Injectable } from '@nestjs/common'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserRole } from '@/core/enums/user-role'

import {
  CartItem,
  CartItemProps,
} from '@/domain/cart/enterprise/entities/cart-item'
import { PrismaCartItemMapper } from '@/infra/database/mappers/prisma-cart-item-mapper'
import { PrismaCartMapper } from '@/infra/database/mappers/prisma-cart-mapper'
import { PrismaClientMapper } from '@/infra/database/mappers/prisma-client-mapper'
import { PrismaUserMapper } from '@/infra/database/mappers/prisma-user-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

import { makeCart } from './make-cart'
import { makeClient } from './make-client'
import { makeUser } from './make-user'

export function makeCartItem(
  override: Partial<CartItemProps>,
  id?: UniqueEntityID,
) {
  const cart = CartItem.create(
    {
      quantity: 1,
      cartId: new UniqueEntityID(),
      productId: new UniqueEntityID(),
      ...override,
    },
    id,
  )

  return cart
}

@Injectable()
export class CartItemFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaCartItem(data: Partial<CartItemProps> = {}) {
    const admin = makeUser({
      role: UserRole.ADMIN,
    })
    const vendor = makeUser({
      role: UserRole.VENDOR,
    })
    const client = makeClient({
      createdByUserId: admin.id,
    })

    const createUsersPromises = [
      this.prisma.user.create({
        data: PrismaUserMapper.toPrisma(admin),
      }),
      this.prisma.user.create({
        data: PrismaUserMapper.toPrisma(vendor),
      }),
    ]

    await Promise.all(createUsersPromises)

    await this.prisma.client.create({
      data: PrismaClientMapper.toPrisma(client),
    })

    const cart = makeCart({
      clientId: client.id,
      ...data,
    })

    await this.prisma.cart.create({
      data: PrismaCartMapper.toPrisma(cart),
    })

    const cartItem = makeCartItem({
      cartId: cart.id,
      ...data,
    })

    await this.prisma.cartItem.create({
      data: PrismaCartItemMapper.toPrisma(cartItem),
    })

    return cartItem
  }
}
