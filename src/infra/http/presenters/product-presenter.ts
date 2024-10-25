import { Product } from '@/domain/product/enterprise/entities/product'

export class ProductPresenter {
  static toHTTP(product: Product) {
    return {
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: product.price.toNumber(),
      discount: product.discount?.toNumber(),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      ownerId: product.ownerId.toString(),
    }
  }
}
