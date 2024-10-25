import { makeClient } from '@test/factories/make-client'
import { makeProduct } from '@test/factories/make-product'
import { makeUser } from '@test/factories/make-user'
import Decimal from 'decimal.js'

import { UserRole } from '@/core/enums/user-role'

import { OrderProcessor } from './order-processor'

let sut: OrderProcessor

describe('Order Processor Helper', () => {
  beforeEach(() => {
    sut = new OrderProcessor()
  })

  const admin = makeUser({
    role: UserRole.ADMIN,
  })
  const vendor = makeUser()
  const client = makeClient({
    createdByUserId: admin.id,
  })
  const productOne = makeProduct({
    ownerId: vendor.id,
    price: new Decimal(10),
  })
  const productTwo = makeProduct({
    ownerId: vendor.id,
    price: new Decimal(20),
  })

  const currentUser = {
    sub: vendor.id.toString(),
    role: UserRole.VENDOR,
  }

  it('should be able to process order', () => {
    const { order, orderItems, notFoundProducts } = sut.processOrderItems({
      clientId: client.id.toString(),
      currentUser,
      items: [
        {
          productId: productOne.id.toString(),
          quantity: 5,
        },
        {
          productId: productOne.id.toString(),
          quantity: 10,
        },
      ],
      products: [productOne, productTwo],
    })

    expect(order).toBeDefined()
    expect(order).toEqual(
      expect.objectContaining({
        clientId: client.id,
        vendorId: vendor.id,
        totalPrice: new Decimal(150),
      }),
    )
    expect(orderItems).toHaveLength(2)
    expect(notFoundProducts).toHaveLength(0)
  })

  it('should be able to process order with not found products', () => {
    const { order, orderItems, notFoundProducts } = sut.processOrderItems({
      clientId: client.id.toString(),
      currentUser,
      items: [
        {
          productId: productOne.id.toString(),
          quantity: 5,
        },
        {
          productId: 'invalid-product-id',
          quantity: 10,
        },
      ],
      products: [productOne],
    })

    expect(order).toBeDefined()
    expect(order).toEqual(
      expect.objectContaining({
        clientId: client.id,
        vendorId: vendor.id,
        totalPrice: new Decimal(50),
      }),
    )
    expect(orderItems).toHaveLength(1)
    expect(notFoundProducts).toHaveLength(1)
    expect(notFoundProducts).toEqual(['invalid-product-id'])
  })
})
