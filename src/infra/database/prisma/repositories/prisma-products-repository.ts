import { Injectable } from '@nestjs/common'

import { ProductsRepository } from '@/domain/product/application/repositories/products-repository'
import { Product } from '@/domain/product/enterprise/entities/product'

import { PrismaProductMapper } from '../../mappers/prisma-product-mapper'
import { PrismaProductWithOwnerMapper } from '../../mappers/prisma-product-with-owner-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async save(data: Product) {
    const product = await this.prisma.product.create({
      data: PrismaProductMapper.toPrisma(data),
    })

    return PrismaProductMapper.toDomain(product)
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return products.map(PrismaProductWithOwnerMapper.toDomain)
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return null
    }

    return PrismaProductMapper.toDomain(product)
  }

  async findByIds(ids: string[]) {
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return products.map(PrismaProductMapper.toDomain)
  }

  async findByIdWithOwner(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!product) {
      return null
    }

    return PrismaProductWithOwnerMapper.toDomain(product)
  }

  async update(data: Product) {
    const product = await this.prisma.product.update({
      where: { id: data.id.toString() },
      data: PrismaProductMapper.toPrisma(data),
    })

    return PrismaProductMapper.toDomain(product)
  }

  async delete(id: string) {
    await this.prisma.product.delete({
      where: { id },
    })
  }
}
