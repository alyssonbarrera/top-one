import { OrderItemsRepository } from '@/domain/order/application/repositories/order-items-repository'
import { OrderItem } from '@/domain/order/enterprise/entities/order-item'

export class InMemoryOrderItemsRepository implements OrderItemsRepository {
  public items: OrderItem[] = []

  async save(data: OrderItem): Promise<OrderItem> {
    this.items.push(data)

    return data
  }

  async findById(id: string): Promise<OrderItem | null> {
    return this.items.find((item) => item.id.toString() === id) || null
  }

  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    return this.items.filter((item) => item.orderId.toString() === orderId)
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id)

    this.items.splice(index, 1)
  }

  async deleteByOrderId(orderId: string): Promise<void> {
    this.items = this.items.filter(
      (item) => item.orderId.toString() !== orderId,
    )
  }

  async update(data: OrderItem): Promise<OrderItem> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === data.id.toString(),
    )

    this.items[index] = data

    return data
  }
}
