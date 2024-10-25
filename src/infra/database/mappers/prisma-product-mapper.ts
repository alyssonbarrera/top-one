import { Product as PrismaProduct } from '@prisma/client'
import Decimal from 'decimal.js'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Product } from '@/domain/product/enterprise/entities/product'

export class PrismaProductMapper {
  static toDomain(product: PrismaProduct): Product {
    return Product.create(
      {
        name: product.name,
        description: product.description,
        price: product.price,
        discount: product.discount ?? new Decimal(0),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt ?? null,
        ownerId: new UniqueEntityID(product.ownerId),
      },
      new UniqueEntityID(product.id),
    )
  }

  static toPrisma(product: Product): PrismaProduct {
    return {
      id: product.id.toString(),
      name: product.name,
      discount: product.discount ?? null,
      description: product.description,
      price: product.price,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt ?? null,
      ownerId: product.ownerId.toString(),
    }
  }
}
