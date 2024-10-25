import { faker } from '@faker-js/faker'
import Decimal from 'decimal.js'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { OrderStatus } from '@/core/enums/order-status'

import {
  OrderWithVendorAndClient,
  OrderWithVendorAndClientProps,
} from '@/domain/order/enterprise/value-objects/order-with-vendor-and-client'

export function makeOrderWithVendorAndClient(
  override: Partial<OrderWithVendorAndClientProps>,
  id?: UniqueEntityID,
) {
  const order = OrderWithVendorAndClient.create({
    clientId: new UniqueEntityID(),
    vendorId: new UniqueEntityID(),
    totalPrice: new Decimal(faker.commerce.price()),
    status: OrderStatus.PROCESSING,
    client: {
      id: new UniqueEntityID(),
      name: 'Client Name',
      email: faker.internet.email(),
    },
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
