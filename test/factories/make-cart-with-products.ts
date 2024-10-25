import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { CartWithProducts } from '@/domain/cart/enterprise/value-objects/cart-with-products'

export function makeCartWithProducts(
  override: Partial<CartWithProducts>,
  id?: UniqueEntityID,
) {
  const cartWithProducts = CartWithProducts.create({
    clientId: new UniqueEntityID(),
    cartId: id ?? new UniqueEntityID(),
    products: [],
    ...override,
  })

  return cartWithProducts
}
