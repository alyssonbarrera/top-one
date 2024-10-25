import { DomainEvents } from '@/core/events/domain-events'

import {
  FindAllOrdersParams,
  OrdersRepository,
} from '@/domain/order/application/repositories/orders-repository'
import { Order } from '@/domain/order/enterprise/entities/order'
import { OrderItem } from '@/domain/order/enterprise/entities/order-item'
import { OrderWithVendor } from '@/domain/order/enterprise/value-objects/order-with-vendor'
import { OrderWithVendorAndClient } from '@/domain/order/enterprise/value-objects/order-with-vendor-and-client'

export class InMemoryOrdersRepository implements OrdersRepository {
  public items: Order[] = []
  public orderItems: OrderItem[] = []
  public itemsWithVendor: OrderWithVendor[] = []
  public itemsWithVendorAndClient: OrderWithVendorAndClient[] = []

  async save(order: Order): Promise<Order> {
    this.items.push(order)

    return order
  }

  async saveWithItems(order: Order, items: OrderItem[]): Promise<Order> {
    this.items.push(order)
    this.orderItems.push(...items)

    return order
  }

  async findAll(
    params: FindAllOrdersParams,
  ): Promise<OrderWithVendorAndClient[]> {
    if (params.filters?.status) {
      return this.itemsWithVendorAndClient.filter(
        (order) => order.status === params.filters?.status,
      )
    }

    return this.itemsWithVendorAndClient
  }

  async findById(id: string) {
    return this.items.find((order) => order.id.toString() === id) || null
  }

  async findByIdWithVendorAndClient(id: string) {
    return (
      this.itemsWithVendorAndClient.find(
        (order) => order.orderId.toString() === id,
      ) || null
    )
  }

  async findByClientId(clientId: string) {
    return this.items.filter((order) => order.clientId.toString() === clientId)
  }

  async findByVendorId(vendorId: string) {
    return this.items.filter((order) => order.vendorId.toString() === vendorId)
  }

  async findByClientIdWithVendor(id: string) {
    return this.itemsWithVendor.filter(
      (order) => order.clientId.toString() === id,
    )
  }

  async update(order: Order): Promise<Order> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === order.id.toString(),
    )

    this.items[index] = order

    DomainEvents.dispatchEventsForAggregate(order.id)

    return order
  }

  async updateWithItems(order: Order, items: OrderItem[]): Promise<Order> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === order.id.toString(),
    )

    this.items[index] = order

    this.orderItems = this.orderItems.filter(
      (item) => item.orderId.toString() !== order.id.toString(),
    )

    this.orderItems.push(...items)

    DomainEvents.dispatchEventsForAggregate(order.id)

    return order
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id)

    this.items.splice(index, 1)
  }
}
