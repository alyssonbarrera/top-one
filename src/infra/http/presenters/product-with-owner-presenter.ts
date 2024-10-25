import { ProductWithOwner } from '@/domain/product/enterprise/value-objects/product-with-owner'

export class ProductWithOwnerPresenter {
  static toHTTP(product: ProductWithOwner) {
    return {
      id: product.productId.toString(),
      name: product.name,
      description: product.description,
      price: product.price.toNumber(),
      discount: product.discount?.toNumber(),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      owner: {
        id: product.owner.id.toString(),
        name: product.owner.name,
        email: product.owner.email,
      },
    }
  }
}
