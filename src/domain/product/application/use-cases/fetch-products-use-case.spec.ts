import { makeProductWithOwner } from '@test/factories/make-product-with-owner'
import { makeUser } from '@test/factories/make-user'
import { InMemoryProductsRepository } from '@test/repositories/in-memory-products-repository'
import Decimal from 'decimal.js'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { FetchProductsUseCase } from './fetch-products-use-case'

let inMemoryProductsRepository: InMemoryProductsRepository
let sut: FetchProductsUseCase

describe('Get Product Use Case', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository()

    sut = new FetchProductsUseCase(inMemoryProductsRepository)
  })

  const defaultVendor = makeUser()
  const currentUser = {
    sub: defaultVendor.id.toString(),
    role: UserRole.ADMIN,
  }

  it('should be able to get a product', async () => {
    const product = makeProductWithOwner({
      ownerId: defaultVendor.id,
      owner: defaultVendor,
    })

    const maxProducts = 10
    for (let index = 0; index < maxProducts; index++) {
      inMemoryProductsRepository.itemsWithOwner.push(product)
    }

    const result = await sut.execute({
      currentUser,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        products: expect.arrayContaining([
          expect.objectContaining({
            name: product.name,
            description: product.description,
            price: new Decimal(product.price),
            ownerId: defaultVendor.id,
            owner: expect.objectContaining({
              id: defaultVendor.id,
              name: defaultVendor.name,
              email: defaultVendor.email,
            }),
          }),
        ]),
      }),
    )
  })

  it('should not be able to get a product with a non-admin user', async () => {
    const product = makeProductWithOwner({ ownerId: defaultVendor.id })
    inMemoryProductsRepository.itemsWithOwner.push(product)

    const result = await sut.execute({
      currentUser: {
        sub: defaultVendor.id.toString(),
        role: UserRole.VENDOR,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })
})
