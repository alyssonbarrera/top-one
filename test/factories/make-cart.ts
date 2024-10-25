import { Injectable } from '@nestjs/common'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserRole } from '@/core/enums/user-role'

import { Cart, CartProps } from '@/domain/cart/enterprise/entities/cart'
import { PrismaCartMapper } from '@/infra/database/mappers/prisma-cart-mapper'
import { PrismaClientMapper } from '@/infra/database/mappers/prisma-client-mapper'
import { PrismaUserMapper } from '@/infra/database/mappers/prisma-user-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

import { makeClient } from './make-client'
import { makeUser } from './make-user'

export function makeCart(override: Partial<CartProps>, id?: UniqueEntityID) {
  const cart = Cart.create(
    {
      clientId: new UniqueEntityID(),
      ...override,
    },
    id,
  )

  return cart
}

@Injectable()
export class CartFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaCart(data: Partial<CartProps> = {}) {
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

    return cart
  }
}
