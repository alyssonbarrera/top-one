import { OrderStatus } from '@/core/enums/order-status'

import { Order } from '../../enterprise/entities/order'
import { OrderItem } from '../../enterprise/entities/order-item'
import { OrderWithVendor } from '../../enterprise/value-objects/order-with-vendor'
import { OrderWithVendorAndClient } from '../../enterprise/value-objects/order-with-vendor-and-client'

export type FindAllOrdersParams = {
  filters?: {
    status?: OrderStatus
  }
}

export type UpdateWithItemsParams = {
  order: Order
  items: OrderItem[]
  itemsToDelete?: OrderItem[]
}

export abstract class OrdersRepository {
  abstract save(data: Order): Promise<Order>
  abstract saveWithItems(order: Order, items: OrderItem[]): Promise<Order>
  abstract findAll(
    params?: FindAllOrdersParams,
  ): Promise<OrderWithVendorAndClient[]>

  abstract findById(id: string): Promise<Order | null>
  abstract findByIdWithVendorAndClient(
    id: string,
  ): Promise<OrderWithVendorAndClient | null>

  abstract findByClientId(clientId: string): Promise<Order[]>
  abstract findByClientIdWithVendor(
    clientId: string,
  ): Promise<OrderWithVendor[]>

  abstract findByVendorId(vendorId: string): Promise<Order[]>

  abstract update(data: Order): Promise<Order>
  abstract updateWithItems(params: UpdateWithItemsParams): Promise<Order>

  abstract delete(id: string): Promise<void>
}
