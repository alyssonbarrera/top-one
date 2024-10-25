import { faker } from '@faker-js/faker'
import Decimal from 'decimal.js'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import {
  ProductWithOwner,
  ProductWithOwnerProps,
} from '@/domain/product/enterprise/value-objects/product-with-owner'

export function makeProductWithOwner(
  override: Partial<ProductWithOwnerProps>,
  id?: UniqueEntityID,
) {
  const ownerId = new UniqueEntityID()

  const product = ProductWithOwner.create({
    name: faker.commerce.productName(),
    discount: new Decimal(10),
    price: new Decimal(faker.commerce.price()),
    description: faker.commerce.productDescription(),
    ownerId,
    owner: {
      id: ownerId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
    },
    productId: id ?? new UniqueEntityID(),
    createdAt: new Date(),
    ...override,
  })

  return product
}
