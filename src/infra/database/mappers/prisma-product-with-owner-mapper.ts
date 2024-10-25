import { Product as PrismaProduct, User as PrismaUser } from '@prisma/client'
import Decimal from 'decimal.js'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { ProductWithOwner } from '@/domain/product/enterprise/value-objects/product-with-owner'

type PrismaProductWithOwner = PrismaProduct & {
  owner: Pick<PrismaUser, 'id' | 'name' | 'email'>
}

export class PrismaProductWithOwnerMapper {
  static toDomain(product: PrismaProductWithOwner): ProductWithOwner {
    return ProductWithOwner.create({
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount ?? new Decimal(0),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt ?? null,
      productId: new UniqueEntityID(product.id),
      ownerId: new UniqueEntityID(product.ownerId),
      owner: {
        id: new UniqueEntityID(product.owner.id),
        name: product.owner.name,
        email: product.owner.email,
      },
    })
  }
}
