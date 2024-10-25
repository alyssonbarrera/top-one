import { makeCart } from '@test/factories/make-cart'
import { makeCartItem } from '@test/factories/make-cart-item'
import { makeCartWithProducts } from '@test/factories/make-cart-with-products'
import { makeClient } from '@test/factories/make-client'
import { makeProduct } from '@test/factories/make-product'
import { makeUser } from '@test/factories/make-user'
import { InMemoryCartsRepository } from '@test/repositories/in-memory-carts-repository'
import { InMemoryOrdersRepository } from '@test/repositories/in-memory-orders-repository'
import { InMemoryProductsRepository } from '@test/repositories/in-memory-products-repository'
import Decimal from 'decimal.js'

import { OrderStatus } from '@/core/enums/order-status'
import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { CreateOrderUseCase } from '@/domain/order/application/use-cases/create-order-use-case'
import { OrderProcessor } from '@/domain/order/application/use-cases/helpers/order-processor'
import { calculateItemPrice } from '@/utils/calculate-item-price'

import { CartNotFoundError } from './errors/cart-not-found-error'
import { FinishCartAndCreateOrderUseCase } from './finish-cart-and-create-order-use-case'

let inMemoryCartsRepository: InMemoryCartsRepository
let orderProcessor: OrderProcessor
let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let createOrderUseCase: CreateOrderUseCase
let sut: FinishCartAndCreateOrderUseCase

describe('Finish Cart And Create Order Use Case', () => {
  beforeEach(() => {
    inMemoryCartsRepository = new InMemoryCartsRepository()
    orderProcessor = new OrderProcessor()
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    inMemoryProductsRepository = new InMemoryProductsRepository()

    createOrderUseCase = new CreateOrderUseCase(
      orderProcessor,
      inMemoryOrdersRepository,
      inMemoryProductsRepository,
    )

    sut = new FinishCartAndCreateOrderUseCase(
      inMemoryCartsRepository,
      createOrderUseCase,
    )
  })

  const admin = makeUser({
    role: UserRole.ADMIN,
  })
  const vendor = makeUser()
  const client = makeClient({
    createdByUserId: admin.id,
  })
  const product = makeProduct({
    ownerId: admin.id,
    price: new Decimal(10),
  })

  const cart = makeCart({
    clientId: client.id,
  })

  const cartItem = makeCartItem({
    cartId: cart.id,
    quantity: 2,
    productId: product.id,
  })

  const cartWithProducts = makeCartWithProducts({
    cartId: cart.id,
    clientId: client.id,
    products: [cartItem],
  })

  cart.products.push(cartItem)

  const currentUser = {
    sub: vendor.id.toString(),
    role: UserRole.VENDOR,
  }

  it('should be able to finish a cart and create a order', async () => {
    inMemoryProductsRepository.items.push(product)
    inMemoryCartsRepository.cartsWithProducts.push(cartWithProducts)

    const result = await sut.execute({
      currentUser,
      id: cart.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        order: expect.objectContaining({
          clientId: client.id,
          vendorId: vendor.id,
          status: OrderStatus.PROCESSING,
          totalPrice: calculateItemPrice({
            price: new Decimal(product.price.toNumber() * 2),
            discount: product.discount,
          }),
        }),
      }),
    )
  })

  it("should not be able to finish a cart and create a order if the cart doesn't exist", async () => {
    const result = await sut.execute({
      currentUser,
      id: cart.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(CartNotFoundError)
  })

  it('should not be able to finish a cart and create a order with a non-vendor user', async () => {
    inMemoryProductsRepository.items.push(product)
    inMemoryCartsRepository.cartsWithProducts.push(cartWithProducts)

    const result = await sut.execute({
      id: cart.id.toString(),
      currentUser: {
        sub: admin.id.toString(),
        role: UserRole.ADMIN,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })
})
