import { makeClient } from '@test/factories/make-client'
import { makeOrderWithVendor } from '@test/factories/make-order-with-vendor'
import { makeUser } from '@test/factories/make-user'
import { InMemoryOrdersRepository } from '@test/repositories/in-memory-orders-repository'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { GetOrdersByClientIdUseCase } from './get-orders-by-client-id-use-case'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: GetOrdersByClientIdUseCase

describe('Get Order By Client Id Use Case', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()

    sut = new GetOrdersByClientIdUseCase(inMemoryOrdersRepository)
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

  it('should be able to get a order', async () => {
    const order = makeOrderWithVendor({
      clientId: client.id,
      vendorId: vendor.id,
    })

    inMemoryOrdersRepository.itemsWithVendor.push(order)

    const result = await sut.execute({
      currentUser,
      clientId: client.id.toString(),
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
            createdAt: order.createdAt,
            totalPrice: order.totalPrice,
          }),
        ]),
      }),
    )
  })

  it('should not be able to get a order when user is not allowed', async () => {
    const order = makeOrderWithVendor({
      clientId: client.id,
      vendorId: vendor.id,
    })

    inMemoryOrdersRepository.itemsWithVendor.push(order)

    const result = await sut.execute({
      currentUser: {
        sub: admin.id.toString(),
        role: UserRole.ADMIN,
      },
      clientId: client.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })
})
