import { makeProduct } from '@test/factories/make-product'
import { makeUser } from '@test/factories/make-user'
import { InMemoryProductsRepository } from '@test/repositories/in-memory-products-repository'
import Decimal from 'decimal.js'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ApplyDiscountUseCase } from './apply-discount-use-case'

let inMemoryProductsRepository: InMemoryProductsRepository
let sut: ApplyDiscountUseCase

describe('Apply Discount Use Case', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository()

    sut = new ApplyDiscountUseCase(inMemoryProductsRepository)
  })

  const defaultVendor = makeUser()
  const currentUser = {
    sub: defaultVendor.id.toString(),
    role: UserRole.ADMIN,
  }

  it('should be able to apply a discount to a product', async () => {
    const product = makeProduct({
      ownerId: defaultVendor.id,
    })

    inMemoryProductsRepository.items.push(product)

    const discount = 10

    const result = await sut.execute({
      id: product.id.toString(),
      currentUser,
      discount,
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryProductsRepository.items).toHaveLength(1)
    expect(inMemoryProductsRepository.items[0]).toEqual(
      expect.objectContaining({
        name: product.name,
        description: product.description,
        discount: new Decimal(discount),
        price: new Decimal(product.price),
        ownerId: defaultVendor.id,
      }),
    )
  })

  it('should not be able to apply a discount to a product if the user is has no permission', async () => {
    const product = makeProduct({
      ownerId: defaultVendor.id,
    })

    inMemoryProductsRepository.items.push(product)

    const discount = 10

    const result = await sut.execute({
      id: product.id.toString(),
      currentUser: {
        sub: defaultVendor.id.toString(),
        role: UserRole.VENDOR,
      },
      discount,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })
})
