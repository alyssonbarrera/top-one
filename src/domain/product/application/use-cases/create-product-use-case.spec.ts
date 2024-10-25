import { faker } from '@faker-js/faker'
import { makeUser } from '@test/factories/make-user'
import { InMemoryProductsRepository } from '@test/repositories/in-memory-products-repository'
import Decimal from 'decimal.js'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { CreateProductUseCase } from './create-product-use-case'

let inMemoryProductsRepository: InMemoryProductsRepository
let sut: CreateProductUseCase

describe('Create Product Use Case', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository()

    sut = new CreateProductUseCase(inMemoryProductsRepository)
  })

  const defaultVendor = makeUser()
  const currentUser = {
    sub: defaultVendor.id.toString(),
    role: UserRole.ADMIN,
  }

  it('should be able to create a product', async () => {
    const productData = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      currentUser,
      discount: 0,
      price: 100,
    }

    const result = await sut.execute(productData)

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryProductsRepository.items).toHaveLength(1)
    expect(inMemoryProductsRepository.items[0]).toEqual(
      expect.objectContaining({
        name: productData.name,
        description: productData.description,
        discount: new Decimal(productData.discount),
        price: new Decimal(productData.price),
        ownerId: defaultVendor.id,
      }),
    )
  })

  it('should not be able to create a product with a non-admin user', async () => {
    const productData = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      currentUser: {
        sub: defaultVendor.id.toString(),
        role: UserRole.VENDOR,
      },
      discount: 0,
      price: 100,
    }

    const result = await sut.execute(productData)

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })
})
