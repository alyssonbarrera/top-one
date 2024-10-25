import { Product } from '../../enterprise/entities/product'
import { ProductWithOwner } from '../../enterprise/value-objects/product-with-owner'

export abstract class ProductsRepository {
  abstract save(data: Product): Promise<Product>
  abstract findAll(): Promise<ProductWithOwner[]>
  abstract findById(id: string): Promise<Product | null>
  abstract findByIds(ids: string[]): Promise<Product[]>
  abstract findByIdWithOwner(id: string): Promise<ProductWithOwner | null>
  abstract update(data: Product): Promise<Product>
  abstract delete(id: string): Promise<void>
}
