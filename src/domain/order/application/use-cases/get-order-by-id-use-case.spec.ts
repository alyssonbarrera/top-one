import { makeClient } from '@test/factories/make-client'
import { makeOrderWithVendor } from '@test/factories/make-order-with-vendor'
import { makeOrderWithVendorAndClient } from '@test/factories/make-order-with-vendor-and-client'
import { makeUser } from '@test/factories/make-user'
import { InMemoryOrdersRepository } from '@test/repositories/in-memory-orders-repository'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { GetOrderByIdUseCase } from './get-order-by-id-use-case'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: GetOrderByIdUseCase

describe('Get Order By Id Use Case', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()

    sut = new GetOrderByIdUseCase(inMemoryOrdersRepository)
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
    const order = makeOrderWithVendorAndClient({
      clientId: client.id,
      vendorId: vendor.id,
    })

    inMemoryOrdersRepository.itemsWithVendorAndClient.push(order)

    const result = await sut.execute({
      currentUser,
      id: order.orderId.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        order: expect.objectContaining({
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
      id: order.orderId.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })
})
