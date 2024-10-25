import { makeClient } from '@test/factories/make-client'
import { makeOrder } from '@test/factories/make-order'
import { makeUser } from '@test/factories/make-user'
import { InMemoryOrdersRepository } from '@test/repositories/in-memory-orders-repository'

import { OrderStatus } from '@/core/enums/order-status'
import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { OrderNotFoundError } from './errors/order-not-found-error'
import { UpdateOrderStatusUseCase } from './update-order-status-use-case'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: UpdateOrderStatusUseCase

describe('Update Order Use Case', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()

    sut = new UpdateOrderStatusUseCase(inMemoryOrdersRepository)
  })

  const admin = makeUser({
    role: UserRole.ADMIN,
  })
  const vendor = makeUser()
  const client = makeClient({
    createdByUserId: admin.id,
  })
  const order = makeOrder({
    clientId: client.id,
    vendorId: vendor.id,
  })

  const currentUser = {
    sub: vendor.id.toString(),
    role: UserRole.VENDOR,
  }

  const orderData = {
    id: order.id.toString(),
    status: OrderStatus.SENT,
    currentUser,
  }

  it('should be able to update a order status', async () => {
    inMemoryOrdersRepository.items.push(order)

    const result = await sut.execute(orderData)

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryOrdersRepository.items).toHaveLength(1)
    expect(inMemoryOrdersRepository.items[0]).toEqual(
      expect.objectContaining({
        clientId: client.id,
        vendorId: vendor.id,
        status: OrderStatus.SENT,
        totalPrice: order.totalPrice,
      }),
    )
  })

  it('should not be able to update a order when order does not exist', async () => {
    const result = await sut.execute({
      ...orderData,
      id: '123',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(OrderNotFoundError)
  })

  it('should not be able to update a order when user is not allowed', async () => {
    inMemoryOrdersRepository.items.push(order)

    const result = await sut.execute({
      ...orderData,
      currentUser: {
        ...currentUser,
        role: UserRole.ADMIN,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })
})
