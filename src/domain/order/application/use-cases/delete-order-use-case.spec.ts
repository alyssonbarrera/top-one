import { makeClient } from '@test/factories/make-client'
import { makeOrder } from '@test/factories/make-order'
import { makeUser } from '@test/factories/make-user'
import { InMemoryOrdersRepository } from '@test/repositories/in-memory-orders-repository'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { DeleteOrderUseCase } from './delete-order-use-case'
import { OrderNotFoundError } from './errors/order-not-found-error'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: DeleteOrderUseCase

describe('Delete Order Use Case', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()

    sut = new DeleteOrderUseCase(inMemoryOrdersRepository)
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

  it('should be able to delete a order', async () => {
    const order = makeOrder({
      clientId: client.id,
      vendorId: vendor.id,
    })

    inMemoryOrdersRepository.items.push(order)

    const result = await sut.execute({
      id: order.id.toString(),
      currentUser,
    })

    expect(result.isRight()).toBeTruthy()
  })

  it('should not be able to delete a order when order does not exist', async () => {
    const result = await sut.execute({
      id: '123',
      currentUser,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(OrderNotFoundError)
  })

  it('should not be able to delete a order when user is not allowed', async () => {
    const order = makeOrder({
      clientId: client.id,
      vendorId: vendor.id,
    })

    inMemoryOrdersRepository.items.push(order)

    const result = await sut.execute({
      id: order.id.toString(),
      currentUser: {
        sub: admin.id.toString(),
        role: UserRole.ADMIN,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })
})
