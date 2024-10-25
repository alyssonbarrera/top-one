import { Injectable } from '@nestjs/common'

import { OrderItemsRepository } from '@/domain/order/application/repositories/order-items-repository'
import { OrderItem } from '@/domain/order/enterprise/entities/order-item'

import { PrismaOrderItemsMapper } from '../../mappers/prisma-order-item-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaOrderItemsRepository implements OrderItemsRepository {
  constructor(private prisma: PrismaService) {}

  async save(data: OrderItem) {
    const orderItem = await this.prisma.orderItem.create({
      data: PrismaOrderItemsMapper.toPrisma(data),
    })

    return PrismaOrderItemsMapper.toDomain(orderItem)
  }

  async findById(id: string) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id },
    })

    if (!orderItem) {
      return null
    }

    return PrismaOrderItemsMapper.toDomain(orderItem)
  }

  async findByOrderId(orderId: string) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId },
    })

    return orderItems.map(PrismaOrderItemsMapper.toDomain)
  }

  async update(data: OrderItem) {
    const orderItem = await this.prisma.orderItem.update({
      where: { id: data.id.toString() },
      data: PrismaOrderItemsMapper.toPrisma(data),
    })

    return PrismaOrderItemsMapper.toDomain(orderItem)
  }

  async delete(id: string) {
    await this.prisma.orderItem.delete({
      where: { id },
    })
  }

  async deleteByOrderId(orderId: string) {
    await this.prisma.orderItem.deleteMany({
      where: { orderId },
    })
  }
}
