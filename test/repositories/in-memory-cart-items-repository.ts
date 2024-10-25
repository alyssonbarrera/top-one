import {
  CartItemsRepository,
  SaveAndUpdateAndDeleteManyParams,
} from '@/domain/cart/application/repositories/cart-items-repository'
import { CartItem } from '@/domain/cart/enterprise/entities/cart-item'

export class InMemoryCartItemsRepository implements CartItemsRepository {
  public items: CartItem[] = []

  async save(data: CartItem) {
    this.items.push(data)

    return data
  }

  async findById(id: string) {
    return this.items.find((item) => item.id.toString() === id) || null
  }

  async findByCartId(cartId: string) {
    return this.items.filter((item) => item.cartId.toString() === cartId)
  }

  async delete(id: string) {
    const index = this.items.findIndex((item) => item.id.toString() === id)

    this.items.splice(index, 1)
  }

  async deleteByCartId(cartId: string) {
    this.items = this.items.filter((item) => item.cartId.toString() !== cartId)
  }

  async update(data: CartItem) {
    const index = this.items.findIndex(
      (item) => item.id.toString() === data.id.toString(),
    )

    this.items[index] = data
  }

  async saveAndUpdateAndDeleteMany({
    itemsToSave,
    itemsToUpdate,
    itemsToDelete,
  }: SaveAndUpdateAndDeleteManyParams) {
    this.items = this.items.filter(
      (item) =>
        !itemsToDelete.some((itemToDelete) => itemToDelete.id.equals(item.id)),
    )

    itemsToUpdate.forEach((itemToUpdate) => {
      const index = this.items.findIndex((item) =>
        item.id.equals(itemToUpdate.id),
      )
      if (index !== -1) {
        this.items[index] = itemToUpdate
      }
    })

    this.items = this.items.concat(itemsToSave)
  }
}
