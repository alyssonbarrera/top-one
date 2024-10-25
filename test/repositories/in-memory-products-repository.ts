import { ProductsRepository } from '@/domain/product/application/repositories/products-repository'
import { Product } from '@/domain/product/enterprise/entities/product'
import { ProductWithOwner } from '@/domain/product/enterprise/value-objects/product-with-owner'

export class InMemoryProductsRepository implements ProductsRepository {
  public items: Product[] = []
  public itemsWithOwner: ProductWithOwner[] = []

  async save(product: Product): Promise<Product> {
    this.items.push(product)

    return product
  }

  async findById(id: string) {
    return this.items.find((product) => product.id.toString() === id) || null
  }

  async findByIds(ids: string[]) {
    return this.items.filter((product) => ids.includes(product.id.toString()))
  }

  async findByIdWithOwner(id: string) {
    return (
      this.itemsWithOwner.find(
        (product) => product.productId.toString() === id,
      ) || null
    )
  }

  async update(product: Product): Promise<Product> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === product.id.toString(),
    )

    this.items[index] = product

    return product
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id)

    this.items.splice(index, 1)
  }

  async findByName(name: string) {
    return this.items.find((product) => product.name === name) || null
  }

  async findAll() {
    return this.itemsWithOwner
  }
}
