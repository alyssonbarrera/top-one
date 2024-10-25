import { CartsRepository } from '@/domain/cart/application/repositories/carts-repository'
import { Cart } from '@/domain/cart/enterprise/entities/cart'
import { CartItem } from '@/domain/cart/enterprise/entities/cart-item'
import { CartWithProducts } from '@/domain/cart/enterprise/value-objects/cart-with-products'

export class InMemoryCartsRepository implements CartsRepository {
  public carts: Cart[] = []
  public cartsWithProducts: CartWithProducts[] = []

  async save(data: Cart) {
    this.carts.push(data)

    return data
  }

  async saveWithProducts(cart: Cart, products: CartItem[]) {
    const cartWithProducts = CartWithProducts.create({
      cartId: cart.id,
      clientId: cart.clientId,
      products,
    })

    this.cartsWithProducts.push(cartWithProducts)

    return cart
  }

  async findById(id: string) {
    return this.carts.find((cart) => cart.id.toString() === id) || null
  }

  async findByClientId(clientId: string) {
    return (
      this.carts.find((cart) => cart.clientId.toString() === clientId) || null
    )
  }

  async findByClientIdWithProducts(clientId: string) {
    return (
      this.cartsWithProducts.find(
        (cart) => cart.clientId.toString() === clientId,
      ) || null
    )
  }

  async update(data: Cart) {
    const index = this.carts.findIndex(
      (cart) => cart.id.toString() === data.id.toString(),
    )

    this.carts[index] = data
  }

  async delete(id: string) {
    const index = this.carts.findIndex((cart) => cart.id.toString() === id)

    this.carts.splice(index, 1)
  }

  async deleteByClientId(clientId: string) {
    this.carts = this.carts.filter(
      (cart) => cart.clientId.toString() !== clientId,
    )
  }
}
