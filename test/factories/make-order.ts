import { Injectable } from '@nestjs/common'

import { faker } from '@faker-js/faker'
import Decimal from 'decimal.js'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { OrderStatus } from '@/core/enums/order-status'
import { UserRole } from '@/core/enums/user-role'

import { Order, OrderProps } from '@/domain/order/enterprise/entities/order'
import { PrismaClientMapper } from '@/infra/database/mappers/prisma-client-mapper'
import { PrismaOrderMapper } from '@/infra/database/mappers/prisma-order-mapper'
import { PrismaUserMapper } from '@/infra/database/mappers/prisma-user-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

import { makeClient } from './make-client'
import { makeUser } from './make-user'

export function makeOrder(override: Partial<OrderProps>, id?: UniqueEntityID) {
  const order = Order.create(
    {
      clientId: new UniqueEntityID(),
      vendorId: new UniqueEntityID(),
      totalPrice: new Decimal(faker.commerce.price()),
      status: OrderStatus.PROCESSING,
      ...override,
    },
    id,
  )

  return order
}

@Injectable()
export class OrderFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaOrder(data: Partial<OrderProps> = {}) {
    const admin = makeUser({
      role: UserRole.ADMIN,
    })
    const vendor = makeUser({
      role: UserRole.VENDOR,
    })
    const client = makeClient({
      createdByUserId: admin.id,
    })
    const order = makeOrder({
      clientId: client.id,
      vendorId: vendor.id,
      ...data,
    })

    const createUsersPromises = [
      this.prisma.user.create({
        data: PrismaUserMapper.toPrisma(admin),
      }),
      this.prisma.user.create({
        data: PrismaUserMapper.toPrisma(vendor),
      }),
    ]

    await Promise.all(createUsersPromises)

    await this.prisma.client.create({
      data: PrismaClientMapper.toPrisma(client),
    })

    await this.prisma.order.create({
      data: PrismaOrderMapper.toPrisma(order),
    })

    return order
  }
}
