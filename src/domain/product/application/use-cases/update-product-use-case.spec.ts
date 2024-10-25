import { faker } from '@faker-js/faker'
import { makeProduct } from '@test/factories/make-product'
import { makeUser } from '@test/factories/make-user'
import { InMemoryProductsRepository } from '@test/repositories/in-memory-products-repository'
import Decimal from 'decimal.js'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ProductNotFoundError } from './errors/product-not-found-error'
import { UpdateProductUseCase } from './update-product-use-case'

let inMemoryProductsRepository: InMemoryProductsRepository
let sut: UpdateProductUseCase

describe('Update Product Use Case', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository()

    sut = new UpdateProductUseCase(inMemoryProductsRepository)
  })

  const defaultVendor = makeUser()
  const currentUser = {
    sub: defaultVendor.id.toString(),
    role: UserRole.ADMIN,
  }

  it('should be able to update a product', async () => {
    const product = makeProduct({
      ownerId: defaultVendor.id,
    })

    inMemoryProductsRepository.items.push(product)

    const updatedProduct = {
      name: 'new name',
      description: 'new description',
      price: 200,
      discount: 10,
    }

    const result = await sut.execute({
      id: product.id.toString(),
      currentUser,
      ...updatedProduct,
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryProductsRepository.items).toHaveLength(1)
    expect(inMemoryProductsRepository.items[0]).toEqual(
      expect.objectContaining({
        name: updatedProduct.name,
        description: updatedProduct.description,
        discount: new Decimal(updatedProduct.discount),
        price: new Decimal(updatedProduct.price),
        ownerId: defaultVendor.id,
      }),
    )
  })

  it('should not be able to update a product that does not exist', async () => {
    const updatedProduct = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      discount: 0,
      price: 100,
    }

    const result = await sut.execute({
      id: '123',
      currentUser,
      ...updatedProduct,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ProductNotFoundError)
  })

  it('should no be able to apply a discount if user has no permission', async () => {
    const product = makeProduct({
      ownerId: defaultVendor.id,
    })

    inMemoryProductsRepository.items.push(product)

    const updatedProduct = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      discount: 10,
      price: 100,
    }

    const result = await sut.execute({
      id: product.id.toString(),
      currentUser: {
        sub: defaultVendor.id.toString(),
        role: UserRole.VENDOR,
      },
      ...updatedProduct,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })

  it('should not be able to update a product with a non-admin user', async () => {
    const product = makeProduct({
      ownerId: defaultVendor.id,
    })

    inMemoryProductsRepository.items.push(product)

    const updatedProduct = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      discount: 0,
      price: 100,
    }

    const result = await sut.execute({
      id: product.id.toString(),
      currentUser: {
        sub: defaultVendor.id.toString(),
        role: UserRole.VENDOR,
      },
      ...updatedProduct,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })
})
