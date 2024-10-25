import { makeClient } from '@test/factories/make-client'
import { makeOrderWithVendorAndClient } from '@test/factories/make-order-with-vendor-and-client'
import { makeUser } from '@test/factories/make-user'
import { InMemoryOrdersRepository } from '@test/repositories/in-memory-orders-repository'

import { OrderStatus } from '@/core/enums/order-status'
import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { FetchOrdersUseCase } from './fetch-orders-use-case'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: FetchOrdersUseCase

describe('Fetch Orders Use Case', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()

    sut = new FetchOrdersUseCase(inMemoryOrdersRepository)
  })

  const admin = makeUser({
    role: UserRole.ADMIN,
  })
  const vendor = makeUser()
  const client = makeClient({
    createdByUserId: admin.id,
  })

  const currentUser = {
    sub: vendor.id.toString(),
    role: UserRole.VENDOR,
  }

  it('should be able to fetch all orders', async () => {
    const order = makeOrderWithVendorAndClient({
      clientId: client.id,
      vendorId: vendor.id,
    })

    inMemoryOrdersRepository.itemsWithVendorAndClient.push(order)

    const result = await sut.execute({
      currentUser,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        orders: expect.arrayContaining([
          expect.objectContaining({
            vendorId: order.vendorId,
            clientId: order.clientId,
            orderId: order.orderId,
            status: order.status,
            vendor: {
              id: order.vendor.id,
              name: order.vendor.name,
              email: order.vendor.email,
            },
            client: {
              id: order.client.id,
              name: order.client.name,
              email: order.client.email,
            },
            createdAt: order.createdAt,
            totalPrice: order.totalPrice,
          }),
        ]),
      }),
    )
  })

  it('should be able to fetch all orders with status filter', async () => {
    const orderWithSentStatus = makeOrderWithVendorAndClient({
      clientId: client.id,
      vendorId: vendor.id,
      status: OrderStatus.SENT,
    })

    inMemoryOrdersRepository.itemsWithVendorAndClient.push(orderWithSentStatus)

    const orderWithProcessingStatus = makeOrderWithVendorAndClient({
      clientId: client.id,
      vendorId: vendor.id,
      status: OrderStatus.PROCESSING,
    })

    inMemoryOrdersRepository.itemsWithVendorAndClient.push(
      orderWithProcessingStatus,
    )

    const result = await sut.execute({
      currentUser,
      status: OrderStatus.SENT,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        orders: expect.arrayContaining([
          expect.objectContaining({
            vendorId: orderWithSentStatus.vendorId,
            clientId: orderWithSentStatus.clientId,
            orderId: orderWithSentStatus.orderId,
            status: orderWithSentStatus.status,
            vendor: {
              id: orderWithSentStatus.vendor.id,
              name: orderWithSentStatus.vendor.name,
              email: orderWithSentStatus.vendor.email,
            },
            client: {
              id: orderWithSentStatus.client.id,
              name: orderWithSentStatus.client.name,
              email: orderWithSentStatus.client.email,
            },
            createdAt: orderWithSentStatus.createdAt,
            totalPrice: orderWithSentStatus.totalPrice,
          }),
        ]),
      }),
    )
  })

  it('should not be able to fetch all orders when user is not allowed', async () => {
    const order = makeOrderWithVendorAndClient({
      clientId: client.id,
      vendorId: vendor.id,
    })

    inMemoryOrdersRepository.itemsWithVendorAndClient.push(order)

    const result = await sut.execute({
      currentUser: {
        sub: admin.id.toString(),
        role: UserRole.ADMIN,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })
})
