import { Injectable } from '@nestjs/common'

import { faker } from '@faker-js/faker'
import Decimal from 'decimal.js'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserRole } from '@/core/enums/user-role'

import {
  Product,
  ProductProps,
} from '@/domain/product/enterprise/entities/product'
import { PrismaProductMapper } from '@/infra/database/mappers/prisma-product-mapper'
import { PrismaUserMapper } from '@/infra/database/mappers/prisma-user-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

import { makeUser } from './make-user'

export function makeProduct(
  override: Partial<ProductProps>,
  id?: UniqueEntityID,
) {
  const product = Product.create(
    {
      name: faker.commerce.productName(),
      price: new Decimal(faker.commerce.price()),
      description: faker.commerce.productDescription(),
      ownerId: new UniqueEntityID(),
      ...override,
    },
    id,
  )

  return product
}

@Injectable()
export class ProductFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaProduct(data: Partial<ProductProps> = {}) {
    const owner = makeUser({
      role: UserRole.ADMIN,
    })
    const product = makeProduct({
      ownerId: owner.id,
      ...data,
    })

    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(owner),
    })

    await this.prisma.product.create({
      data: PrismaProductMapper.toPrisma(product),
    })

    return product
  }
}
