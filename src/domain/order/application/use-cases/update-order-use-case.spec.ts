import { makeClient } from '@test/factories/make-client'
import { makeOrder } from '@test/factories/make-order'
import { makeProduct } from '@test/factories/make-product'
import { makeUser } from '@test/factories/make-user'
import { InMemoryOrderItemsRepository } from '@test/repositories/in-memory-order-items-repository'
import { InMemoryOrdersRepository } from '@test/repositories/in-memory-orders-repository'
import { InMemoryProductsRepository } from '@test/repositories/in-memory-products-repository'
import Decimal from 'decimal.js'

import { OrderStatus } from '@/core/enums/order-status'
import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { Client } from '@/domain/client/enterprise/entities/client'
import { Product } from '@/domain/product/enterprise/entities/product'
import { User } from '@/domain/user/enterprise/entities/user'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { calculateItemPrice } from '@/utils/calculate-item-price'

import { Order } from '../../enterprise/entities/order'

import { OrderNotFoundError } from './errors/order-not-found-error'
import { OrderProcessor } from './helpers/order-processor'
import { UpdateOrderUseCase } from './update-order-use-case'

let orderProcessor: OrderProcessor
let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryOrderItemsRepository: InMemoryOrderItemsRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let sut: UpdateOrderUseCase

let order: Order
let admin: User
let product: Product
let currentUser: UserPayload
let vendor: User
let clientOne: Client
let clientTwo: Client

describe('Create Order Use Case', () => {
  beforeEach(() => {
    orderProcessor = new OrderProcessor()

    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    inMemoryProductsRepository = new InMemoryProductsRepository()
    inMemoryOrderItemsRepository = new InMemoryOrderItemsRepository()

    admin = makeUser({
      role: UserRole.ADMIN,
    })

    vendor = makeUser()

    clientOne = makeClient({
      createdByUserId: admin.id,
    })

    clientTwo = makeClient({
      createdByUserId: admin.id,
    })

    product = makeProduct({
      ownerId: admin.id,
    })

    order = makeOrder({
      clientId: clientOne.id,
      vendorId: vendor.id,
      status: OrderStatus.PROCESSING,
    })

    currentUser = {
      sub: vendor.id.toString(),
      role: UserRole.VENDOR,
    }

    sut = new UpdateOrderUseCase(
      orderProcessor,
      inMemoryOrdersRepository,
      inMemoryOrderItemsRepository,
      inMemoryProductsRepository,
    )
  })

  it('should be able to update a order', async () => {
    inMemoryProductsRepository.items.push(product)
    inMemoryOrdersRepository.items.push(order)

    const result = await sut.execute({
      id: order.id.toString(),
      currentUser,
      clientId: clientTwo.id.toString(),
      status: OrderStatus.PROCESSING,
      items: [
        {
          productId: product.id.toString(),
          quantity: 5,
        },
      ],
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryOrdersRepository.items).toHaveLength(1)
    expect(inMemoryOrdersRepository.items[0]).toEqual(
      expect.objectContaining({
        clientId: clientTwo.id,
        vendorId: vendor.id,
        totalPrice: calculateItemPrice({
          price: new Decimal(product.price.toNumber() * 5),
          discount: product.discount,
        }),
      }),
    )
  })

  it('should be able to update a order without items', async () => {
    inMemoryProductsRepository.items.push(product)
    inMemoryOrdersRepository.items.push(order)

    const result = await sut.execute({
      id: order.id.toString(),
      currentUser,
      status: OrderStatus.SENT,
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryOrdersRepository.items).toHaveLength(1)
    expect(inMemoryOrdersRepository.items[0]).toEqual(
      expect.objectContaining({
        clientId: clientOne.id,
        vendorId: vendor.id,
        status: OrderStatus.SENT,
        totalPrice: order.totalPrice,
      }),
    )
  })

  it("should not be able to update a order that doesn't exist", async () => {
    const result = await sut.execute({
      currentUser,
      id: order.id.toString(),
      status: OrderStatus.PROCESSING,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(OrderNotFoundError)
  })

  it('should not be able to update a order with a non-vendor user', async () => {
    inMemoryOrdersRepository.items.push(order)

    const result = await sut.execute({
      id: order.id.toString(),
      status: OrderStatus.PROCESSING,
      currentUser: {
        ...currentUser,
        role: UserRole.ADMIN,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })

  it('should not be able to update a order with status sent', async () => {
    order.status = OrderStatus.SENT
    inMemoryOrdersRepository.items.push(order)

    const result = await sut.execute({
      id: order.id.toString(),
      status: OrderStatus.SENT,
      currentUser,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })
})
