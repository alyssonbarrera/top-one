import { makeCartItem } from '@test/factories/make-cart-item'
import { makeCartWithProducts } from '@test/factories/make-cart-with-products'
import { makeClient } from '@test/factories/make-client'
import { makeProduct } from '@test/factories/make-product'
import { makeUser } from '@test/factories/make-user'
import { InMemoryCartItemsRepository } from '@test/repositories/in-memory-cart-items-repository'
import { InMemoryCartsRepository } from '@test/repositories/in-memory-carts-repository'
import { InMemoryClientsRepository } from '@test/repositories/in-memory-clients-repository'
import { InMemoryProductsRepository } from '@test/repositories/in-memory-products-repository'
import Decimal from 'decimal.js'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserRole } from '@/core/enums/user-role'

import { ClientNotFoundError } from '@/domain/client/application/use-cases/errors/client-not-found-error'

import { AddProductsToCartUseCase } from './add-products-to-cart-use-case'
import { CartProcessor } from './helpers/cart-processor'

let inMemoryCartsRepository: InMemoryCartsRepository
let inMemoryCartItemsRepository: InMemoryCartItemsRepository
let inMemoryClientsRepository: InMemoryClientsRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let cartProcessor: CartProcessor
let sut: AddProductsToCartUseCase

describe('Add Products To Cart Use Case', () => {
  beforeEach(() => {
    inMemoryCartsRepository = new InMemoryCartsRepository()
    inMemoryProductsRepository = new InMemoryProductsRepository()
    inMemoryClientsRepository = new InMemoryClientsRepository()
    inMemoryCartItemsRepository = new InMemoryCartItemsRepository()
    cartProcessor = new CartProcessor(inMemoryProductsRepository)

    sut = new AddProductsToCartUseCase(
      inMemoryCartsRepository,
      inMemoryClientsRepository,
      inMemoryCartItemsRepository,
      cartProcessor,
    )
  })

  const admin = makeUser({
    role: UserRole.ADMIN,
  })
  const client = makeClient({
    createdByUserId: admin.id,
  })
  const productOne = makeProduct({
    ownerId: admin.id,
    price: new Decimal(10),
  })

  const productTwo = makeProduct({
    ownerId: admin.id,
    price: new Decimal(15),
  })

  const cartData = {
    products: [
      {
        productId: productOne.id.toString(),
        quantity: 5,
      },
      {
        productId: productTwo.id.toString(),
        quantity: 10,
      },
    ],
  }

  it('should be able to add products to a cart', async () => {
    inMemoryClientsRepository.items.push(client)
    inMemoryProductsRepository.items.push(productOne, productTwo)

    const result = await sut.execute({
      clientId: client.id.toString(),
      products: cartData.products,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        cart: expect.objectContaining({
          cartId: expect.any(UniqueEntityID),
          clientId: client.id,
          totalPrice:
            productOne.price.toNumber() * 5 + productTwo.price.toNumber() * 10,
        }),
        notFoundProducts: undefined,
      }),
    )
  })

  it("should be able to change the quantity of a product that's already in the cart", async () => {
    inMemoryClientsRepository.items.push(client)
    inMemoryProductsRepository.items.push(productOne, productTwo)

    const cartResult = await sut.execute({
      clientId: client.id.toString(),
      products: cartData.products,
    })

    const cartValue = cartResult.value as { cart: { cartId: UniqueEntityID } }

    const updatedCartData = {
      products: [
        {
          productId: productOne.id.toString(),
          quantity: 3,
        },
        {
          productId: productTwo.id.toString(),
          quantity: 7,
        },
      ],
    }

    const result = await sut.execute({
      clientId: client.id.toString(),
      products: updatedCartData.products,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        cart: expect.objectContaining({
          cartId: cartValue.cart.cartId,
          clientId: client.id,
          totalPrice:
            productOne.price.toNumber() * 3 + productTwo.price.toNumber() * 7,
        }),
        notFoundProducts: undefined,
      }),
    )
  })

  it('should not be able to add products to a cart when client does not exist', async () => {
    inMemoryProductsRepository.items.push(productOne, productTwo)

    const result = await sut.execute({
      clientId: client.id.toString(),
      products: cartData.products,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ClientNotFoundError)
  })

  it('should not be able to add products that do not exist to a cart', async () => {
    inMemoryClientsRepository.items.push(client)
    inMemoryProductsRepository.items.push(productOne)

    const result = await sut.execute({
      clientId: client.id.toString(),
      products: cartData.products,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        cart: expect.objectContaining({
          cartId: expect.any(UniqueEntityID),
          clientId: client.id,
          totalPrice: productOne.price.toNumber() * 5,
        }),
        notFoundProducts: expect.arrayContaining([productTwo.id.toString()]),
      }),
    )
  })

  it('should not be able to add products that do not exist to a cart when cart already exists', async () => {
    const cart = makeCartWithProducts({
      clientId: client.id,
    })

    const cartItem = makeCartItem({
      cartId: cart.cartId,
      productId: productOne.id,
      quantity: 5,
    })

    cart.products.push(cartItem)

    inMemoryCartsRepository.cartsWithProducts.push(cart)
    inMemoryCartItemsRepository.items.push(cartItem)
    inMemoryClientsRepository.items.push(client)
    inMemoryProductsRepository.items.push(productOne)

    const result = await sut.execute({
      clientId: client.id.toString(),
      products: cartData.products,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        cart: expect.objectContaining({
          cartId: expect.any(UniqueEntityID),
          clientId: client.id,
          totalPrice: productOne.price.toNumber() * 5,
        }),
        notFoundProducts: expect.arrayContaining([productTwo.id.toString()]),
      }),
    )
  })
})
