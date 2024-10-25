import { CartItem } from '../../enterprise/entities/cart-item'

export type SaveAndUpdateAndDeleteManyParams = {
  itemsToSave: CartItem[]
  itemsToUpdate: CartItem[]
  itemsToDelete: CartItem[]
}

export abstract class CartItemsRepository {
  abstract save(cartItem: CartItem): Promise<CartItem>
  abstract findById(id: string): Promise<CartItem | null>
  abstract findByCartId(cartId: string): Promise<CartItem[]>
  abstract delete(id: string): Promise<void>
  abstract deleteByCartId(cartId: string): Promise<void>
  abstract update(cartItem: CartItem): Promise<void>

  abstract saveAndUpdateAndDeleteMany(
    params: SaveAndUpdateAndDeleteManyParams,
  ): Promise<void>
}
