import { faker } from '@faker-js/faker'
import Decimal from 'decimal.js'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { OrderStatus } from '@/core/enums/order-status'

import {
  OrderWithVendor,
  OrderWithVendorProps,
} from '@/domain/order/enterprise/value-objects/order-with-vendor'

export function makeOrderWithVendor(
  override: Partial<OrderWithVendorProps>,
  id?: UniqueEntityID,
) {
  const order = OrderWithVendor.create({
    clientId: new UniqueEntityID(),
    vendorId: new UniqueEntityID(),
    totalPrice: new Decimal(faker.commerce.price()),
    status: OrderStatus.PROCESSING,
    vendor: {
      id: new UniqueEntityID(),
      name: 'Vendor Name',
      email: faker.internet.email(),
    },
    orderId: id ?? new UniqueEntityID(),
    createdAt: new Date(),
    ...override,
  })

  return order
}
