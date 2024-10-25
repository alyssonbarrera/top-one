import { Injectable } from '@nestjs/common'

import { CartsRepository } from '@/domain/cart/application/repositories/carts-repository'
import { Cart } from '@/domain/cart/enterprise/entities/cart'
import { CartItem } from '@/domain/cart/enterprise/entities/cart-item'

import { PrismaCartItemMapper } from '../../mappers/prisma-cart-item-mapper'
import { PrismaCartMapper } from '../../mappers/prisma-cart-mapper'
import { PrismaCartWithProductsMapper } from '../../mappers/prisma-cart-with-products-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaCartsRepository implements CartsRepository {
  constructor(private prisma: PrismaService) {}

  async save(data: Cart) {
    const cart = await this.prisma.cart.create({
      data: PrismaCartMapper.toPrisma(data),
    })

    return PrismaCartMapper.toDomain(cart)
  }

  async saveWithProducts(cart: Cart, items: CartItem[]) {
    const createdCart = await this.prisma.cart.create({
      data: {
        ...PrismaCartMapper.toPrisma(cart),
        products: {
          create: items.map(PrismaCartItemMapper.toPrismaWithoutCartId),
        },
      },
    })

    return PrismaCartMapper.toDomain(createdCart)
  }

  async findById(id: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
    })

    if (!cart) {
      return null
    }

    return PrismaCartMapper.toDomain(cart)
  }

  async findByIdWithProducts(id: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { id },
      include: {
        products: true,
      },
    })

    if (!cart) {
      return null
    }

    return PrismaCartWithProductsMapper.toDomain(cart)
  }

  async findByClientId(clientId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { clientId },
    })

    if (!cart) {
      return null
    }

    return PrismaCartMapper.toDomain(cart)
  }

  async findByClientIdWithProducts(clientId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { clientId },
      include: {
        products: true,
      },
    })

    if (!cart) {
      return null
    }

    return PrismaCartWithProductsMapper.toDomain(cart)
  }

  async delete(id: string) {
    await this.prisma.cart.delete({
      where: { id },
    })
  }

  async deleteByClientId(clientId: string) {
    await this.prisma.cart.deleteMany({
      where: { clientId },
    })
  }
}
