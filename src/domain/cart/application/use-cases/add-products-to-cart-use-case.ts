import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ClientsRepository } from '@/domain/client/application/repositories/clients-repository'
import { ClientNotFoundError } from '@/domain/client/application/use-cases/errors/client-not-found-error'

import { Cart } from '../../enterprise/entities/cart'
import { CartWithTotalPrice } from '../../enterprise/value-objects/cart-with-total-price'
import { CartItemsRepository } from '../repositories/cart-items-repository'
import { CartsRepository } from '../repositories/carts-repository'

import { CartProcessor } from './helpers/cart-processor'

export type CartProductItem = {
  productId: string
  quantity: number
}

interface AddProductsToCartUseCaseRequest {
  clientId: string
  products: CartProductItem[]
}

type AddProductsToCartUseCaseResponse = Either<
  ForbiddenError | ClientNotFoundError,
  {
    cart: CartWithTotalPrice
  }
>

@Injectable()
export class AddProductsToCartUseCase {
  constructor(
    private cartsRepository: CartsRepository,
    private clientsRepository: ClientsRepository,
    private cartItemsRepository: CartItemsRepository,
    private cartProcessor: CartProcessor,
  ) {}

  async execute({
    clientId,
    products,
  }: AddProductsToCartUseCaseRequest): Promise<AddProductsToCartUseCaseResponse> {
    const client = await this.clientsRepository.findById(clientId)

    if (!client) {
      return left(new ClientNotFoundError())
    }

    const productsIds = this.cartProcessor.getProductsIds(products)
    const productsOnDatabase =
      await this.cartProcessor.getExistingProducts(productsIds)

    const notFoundProducts = this.cartProcessor.getNotFoundProducts(
      products,
      productsOnDatabase,
    )

    const productsWithoutNotFoundProducts =
      this.cartProcessor.getProductsWithoutNotFoundProducts(
        products,
        notFoundProducts,
      )

    const cartOnDatabase =
      await this.cartsRepository.findByClientIdWithProducts(clientId)

    const cart = Cart.create({
      clientId: new UniqueEntityID(clientId),
    })

    if (!cartOnDatabase) {
      const cartItems = this.cartProcessor.createCartItems(
        productsWithoutNotFoundProducts,
        cart.id,
      )

      cart.products = cartItems

      await this.cartsRepository.saveWithProducts(cart, cartItems)

      const totalPrice = this.cartProcessor.calculateTotalPrice(
        products,
        productsOnDatabase,
      )

      const finalCart = CartWithTotalPrice.create({
        cartId: cart.id,
        clientId: cart.clientId,
        totalPrice,
      })

      return right({
        cart: finalCart,
      })
    }

    const { products: productsOnCartDatabase } = cartOnDatabase

    const productsToUpdate = this.cartProcessor.updateCartItems({
      products: productsOnCartDatabase,
      productsWithoutNotFoundProducts,
    })

    const productsToInsert = this.cartProcessor.createCartItems(
      productsWithoutNotFoundProducts,
      cartOnDatabase.cartId,
    )

    const productsToDelete =
      this.cartProcessor.deleteCartItems(productsToUpdate)

    await this.cartItemsRepository.saveAndUpdateAndDeleteMany({
      itemsToSave: productsToInsert,
      itemsToUpdate: productsToUpdate,
      itemsToDelete: productsToDelete,
    })

    cartOnDatabase.products = this.cartProcessor.generateUpdatedCartItems({
      products: productsOnCartDatabase,
      productsToDelete,
      productsToInsert,
    })

    const totalPrice = this.cartProcessor.calculateTotalPrice(
      products,
      productsOnDatabase,
    )

    const finalCart = CartWithTotalPrice.create({
      cartId: cartOnDatabase.cartId,
      clientId: cartOnDatabase.clientId,
      totalPrice,
    })

    return right({
      cart: finalCart,
    })
  }
}
