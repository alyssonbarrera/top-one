import { Injectable } from '@nestjs/common'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { CartItem } from '@/domain/cart/enterprise/entities/cart-item'
import { ProductsRepository } from '@/domain/product/application/repositories/products-repository'
import { Product } from '@/domain/product/enterprise/entities/product'
import { calculateItemPrice } from '@/utils/calculate-item-price'

import { CartProductItem } from '../add-products-to-cart-use-case'

@Injectable()
export class CartProcessor {
  constructor(private productsRepository: ProductsRepository) {}

  public getProductsIds(products: CartProductItem[]) {
    return products.map((product) => product.productId)
  }

  public async getExistingProducts(productsIds: string[]) {
    return await this.productsRepository.findByIds(productsIds)
  }

  public getNotFoundProducts(
    products: CartProductItem[],
    existingProducts: Product[],
  ) {
    return products.filter(
      (product) =>
        !existingProducts.find((existingProduct) =>
          existingProduct.id.equals(new UniqueEntityID(product.productId)),
        ),
    )
  }

  public getProductsWithoutNotFoundProducts(
    products: CartProductItem[],
    notFoundProducts: CartProductItem[],
  ) {
    return products.filter(
      (product) =>
        !notFoundProducts.find(
          (notFoundProduct) => notFoundProduct === product,
        ),
    )
  }

  public createCartItems(products: CartProductItem[], cartId: UniqueEntityID) {
    return products.map((product) =>
      CartItem.create({
        productId: new UniqueEntityID(product.productId),
        quantity: product.quantity,
        cartId,
      }),
    )
  }

  public updateCartItems({
    products,
    productsWithoutNotFoundProducts,
  }: {
    products: CartItem[]
    productsWithoutNotFoundProducts: CartProductItem[]
  }) {
    const productsToUpdate: CartItem[] = []

    for (const product of products) {
      for (const productToAdd of productsWithoutNotFoundProducts) {
        if (
          product.productId.equals(new UniqueEntityID(productToAdd.productId))
        ) {
          product.quantity = productToAdd.quantity
          productsToUpdate.push(product)
          productsWithoutNotFoundProducts.splice(
            productsWithoutNotFoundProducts.indexOf(productToAdd),
            1,
          )
        }
      }
    }

    return productsToUpdate
  }

  public deleteCartItems(productsToUpdate: CartItem[]) {
    const productsToDelete: CartItem[] = []

    for (const product of productsToUpdate) {
      if (product.quantity === 0) {
        productsToDelete.push(product)
        productsToUpdate.splice(productsToUpdate.indexOf(product), 1)
      }
    }

    return productsToDelete
  }

  public generateUpdatedCartItems({
    products,
    productsToDelete,
    productsToInsert,
  }: {
    products: CartItem[]
    productsToDelete: CartItem[]
    productsToInsert: CartItem[]
  }): CartItem[] {
    const remainingProducts = this.filterOutDeletedProducts(
      products,
      productsToDelete,
    )
    return this.mergeProducts(remainingProducts, productsToInsert)
  }

  private filterOutDeletedProducts(
    products: CartItem[],
    productsToDelete: CartItem[],
  ): CartItem[] {
    return products.filter(
      (product) =>
        !productsToDelete.some((productToDelete) =>
          productToDelete.productId.equals(product.productId),
        ),
    )
  }

  private mergeProducts(
    existingProducts: CartItem[],
    newProducts: CartItem[],
  ): CartItem[] {
    return [...existingProducts, ...newProducts]
  }

  public calculateTotalPrice(
    products: CartProductItem[],
    productsOnDatabase: Product[],
  ) {
    return products.reduce((acc, product) => {
      const productOnDatabase = productsOnDatabase.find((productOnDatabase) =>
        productOnDatabase.id.equals(new UniqueEntityID(product.productId)),
      )

      if (!productOnDatabase) return acc

      const priceWithDiscount = calculateItemPrice({
        price: productOnDatabase.price,
        discount: productOnDatabase.discount,
      })

      return acc + priceWithDiscount.toNumber() * product.quantity
    }, 0)
  }
}
