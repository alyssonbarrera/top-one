import { makeProductWithOwner } from '@test/factories/make-product-with-owner'
import { makeUser } from '@test/factories/make-user'
import { InMemoryProductsRepository } from '@test/repositories/in-memory-products-repository'
import Decimal from 'decimal.js'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ProductNotFoundError } from './errors/product-not-found-error'
import { GetProductByIdUseCase } from './get-product-by-id-use-case'

let inMemoryProductsRepository: InMemoryProductsRepository
let sut: GetProductByIdUseCase

describe('Get Product Use Case', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository()

    sut = new GetProductByIdUseCase(inMemoryProductsRepository)
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
    inMemoryProductsRepository.itemsWithOwner.push(product)

    const result = await sut.execute({
      id: product.productId.toString(),
      currentUser,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        product: expect.objectContaining({
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
      }),
    )
  })

  it('should not be able to get a product with a non-admin user', async () => {
    const product = makeProductWithOwner({ ownerId: defaultVendor.id })
    inMemoryProductsRepository.itemsWithOwner.push(product)

    const result = await sut.execute({
      id: product.productId.toString(),
      currentUser: {
        sub: defaultVendor.id.toString(),
        role: UserRole.VENDOR,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })

  it('should not be able to get a product that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
      currentUser,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ProductNotFoundError)
  })
})
