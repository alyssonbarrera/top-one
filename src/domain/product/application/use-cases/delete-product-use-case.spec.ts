import { makeProduct } from '@test/factories/make-product'
import { makeUser } from '@test/factories/make-user'
import { InMemoryProductsRepository } from '@test/repositories/in-memory-products-repository'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { DeleteProductUseCase } from './delete-product-use-case'
import { ProductNotFoundError } from './errors/product-not-found-error'

let inMemoryProductsRepository: InMemoryProductsRepository
let sut: DeleteProductUseCase

describe('Delete Product Use Case', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository()

    sut = new DeleteProductUseCase(inMemoryProductsRepository)
  })

  const defaultVendor = makeUser()
  const currentUser = {
    sub: defaultVendor.id.toString(),
    role: UserRole.ADMIN,
  }

  it('should be able to delete a product', async () => {
    const product = makeProduct({
      ownerId: defaultVendor.id,
    })
    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      id: product.id.toString(),
      currentUser,
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryProductsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a product with a non-admin user', async () => {
    const product = makeProduct({
      ownerId: defaultVendor.id,
    })
    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      id: product.id.toString(),
      currentUser: {
        sub: defaultVendor.id.toString(),
        role: UserRole.VENDOR,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })

  it('should not be able to delete a product that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
      currentUser,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ProductNotFoundError)
  })
})
