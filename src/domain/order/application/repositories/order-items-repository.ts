import { OrderItem } from '../../enterprise/entities/order-item'

export abstract class OrderItemsRepository {
  abstract save(data: OrderItem): Promise<OrderItem>
  abstract findById(id: string): Promise<OrderItem | null>
  abstract findByOrderId(orderId: string): Promise<OrderItem[]>
  abstract update(data: OrderItem): Promise<OrderItem>
  abstract delete(id: string): Promise<void>
  abstract deleteByOrderId(orderId: string): Promise<void>
}
