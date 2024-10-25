import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import {
  CartItemsRepository,
  SaveAndUpdateAndDeleteManyParams,
} from '@/domain/cart/application/repositories/cart-items-repository'
import { CartItem } from '@/domain/cart/enterprise/entities/cart-item'

import { PrismaCartItemMapper } from '../../mappers/prisma-cart-item-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaCartItemsRepository implements CartItemsRepository {
  constructor(private prisma: PrismaService) {}

  async save(data: CartItem) {
    const cartItem = await this.prisma.cartItem.create({
      data: PrismaCartItemMapper.toPrisma(data),
    })

    return PrismaCartItemMapper.toDomain(cartItem)
  }

  async findById(id: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id },
    })

    if (!cartItem) {
      return null
    }

    return PrismaCartItemMapper.toDomain(cartItem)
  }

  async findByCartId(cartId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { cartId },
    })

    return cartItems.map((cartItem) => PrismaCartItemMapper.toDomain(cartItem))
  }

  async delete(id: string) {
    await this.prisma.cartItem.delete({
      where: { id },
    })
  }

  async deleteByCartId(cartId: string) {
    await this.prisma.cartItem.deleteMany({
      where: { cartId },
    })
  }

  async update(data: CartItem) {
    await this.prisma.cartItem.update({
      where: { id: data.id.toString() },
      data: PrismaCartItemMapper.toPrisma(data),
    })
  }

  async saveAndUpdateAndDeleteMany({
    itemsToSave,
    itemsToDelete,
    itemsToUpdate,
  }: SaveAndUpdateAndDeleteManyParams) {
    const operations: Prisma.PrismaPromise<any>[] = []

    if (itemsToDelete.length) {
      operations.push(
        this.prisma.cartItem.deleteMany({
          where: {
            id: {
              in: itemsToDelete.map((cartItem) => cartItem.id.toString()),
            },
          },
        }),
      )
    }

    if (itemsToSave.length) {
      operations.push(
        ...itemsToSave.map((cartItem) =>
          this.prisma.cartItem.create({
            data: PrismaCartItemMapper.toPrisma(cartItem),
          }),
        ),
      )
    }

    if (itemsToUpdate.length) {
      operations.push(
        ...itemsToUpdate.map((cartItem) =>
          this.prisma.cartItem.update({
            where: { id: cartItem.id.toString() },
            data: PrismaCartItemMapper.toPrisma(cartItem),
          }),
        ),
      )
    }

    if (operations.length) {
      await this.prisma.$transaction(operations)
    }
  }
}
