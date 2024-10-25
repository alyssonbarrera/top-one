import { Injectable } from '@nestjs/common'

import { DomainEvents } from '@/core/events/domain-events'

import {
  FindAllOrdersParams,
  OrdersRepository,
} from '@/domain/order/application/repositories/orders-repository'
import { Order } from '@/domain/order/enterprise/entities/order'
import { OrderItem } from '@/domain/order/enterprise/entities/order-item'

import { PrismaOrderItemsMapper } from '../../mappers/prisma-order-item-mapper'
import { PrismaOrderMapper } from '../../mappers/prisma-order-mapper'
import { PrismaOrderWithVendorAndClientMapper } from '../../mappers/prisma-order-with-vendor-and-client-mapper'
import { PrismaOrderWithVendorMapper } from '../../mappers/prisma-order-with-vendor-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private prisma: PrismaService) {}

  async save(data: Order) {
    const order = await this.prisma.order.create({
      data: PrismaOrderMapper.toPrisma(data),
    })

    return PrismaOrderMapper.toDomain(order)
  }

  async saveWithItems(order: Order, items: OrderItem[]) {
    const orderWithItems = await this.prisma.order.create({
      data: {
        ...PrismaOrderMapper.toPrisma(order),
        orderItems: {
          createMany: {
            data: items.map(PrismaOrderItemsMapper.toPrismaWithoutOrderId),
          },
        },
      },
    })

    return PrismaOrderMapper.toDomain(orderWithItems)
  }

  async findAll(params?: FindAllOrdersParams) {
    const filters = params?.filters || {}

    const orders = await this.prisma.order.findMany({
      where: {
        status: filters.status,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return orders.map(PrismaOrderWithVendorAndClientMapper.toDomain)
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return null
    }

    return PrismaOrderMapper.toDomain(order)
  }

  async findByClientId(clientId: string) {
    const orders = await this.prisma.order.findMany({
      where: { clientId },
    })

    return orders.map(PrismaOrderMapper.toDomain)
  }

  async findByClientIdWithVendor(clientId: string) {
    const orders = await this.prisma.order.findMany({
      where: { clientId },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return orders.map(PrismaOrderWithVendorMapper.toDomain)
  }

  async findByVendorId(vendorId: string) {
    const orders = await this.prisma.order.findMany({
      where: { vendorId },
    })

    return orders.map(PrismaOrderMapper.toDomain)
  }

  async findByIdWithVendorAndClient(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!order) {
      return null
    }

    return PrismaOrderWithVendorAndClientMapper.toDomain(order)
  }

  async update(data: Order) {
    const order = await this.prisma.order.update({
      where: { id: data.id.toString() },
      data: PrismaOrderMapper.toPrisma(data),
    })

    DomainEvents.dispatchEventsForAggregate(data.id)

    return PrismaOrderMapper.toDomain(order)
  }

  async updateWithItems(order: Order, items: OrderItem[]) {
    const [updatedOrder] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: order.id.toString() },
        data: PrismaOrderMapper.toPrisma(order),
      }),
      this.prisma.orderItem.deleteMany({
        where: { orderId: order.id.toString() },
      }),
      this.prisma.orderItem.createMany({
        data: items.map(PrismaOrderItemsMapper.toPrisma),
      }),
    ])

    return PrismaOrderMapper.toDomain(updatedOrder)
  }

  async delete(id: string) {
    await this.prisma.order.delete({
      where: { id },
    })
  }
}
