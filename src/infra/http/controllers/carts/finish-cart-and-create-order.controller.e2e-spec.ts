import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'

import { makeAccessToken } from '@test/factories/make-access-token'
import { CartFactory } from '@test/factories/make-cart'
import { CartItemFactory } from '@test/factories/make-cart-item'
import { ClientFactory } from '@test/factories/make-client'
import { ProductFactory } from '@test/factories/make-product'
import { UserFactory } from '@test/factories/make-user'
import request from 'supertest'

import { OrderStatus } from '@/core/enums/order-status'
import { UserRole } from '@/core/enums/user-role'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Finish Cart And Create Order (E2E)', () => {
  let app: INestApplication
  let cartFactory: CartFactory
  let userFactory: UserFactory
  let clientFactory: ClientFactory
  let productFactory: ProductFactory
  let cartItemFactory: CartItemFactory
  let jwt: JwtService
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        UserFactory,
        ClientFactory,
        ProductFactory,
        CartFactory,
        CartItemFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    cartFactory = moduleRef.get(CartFactory)
    cartItemFactory = moduleRef.get(CartItemFactory)
    userFactory = moduleRef.get(UserFactory)
    clientFactory = moduleRef.get(ClientFactory)
    productFactory = moduleRef.get(ProductFactory)

    jwt = moduleRef.get(JwtService)
    prisma = app.get(PrismaService)

    await app.init()
  })

  test('[POST] /orders', async () => {
    const admin = await userFactory.makePrismaUser({
      role: UserRole.ADMIN,
    })

    const vendor = await userFactory.makePrismaUser({
      role: UserRole.VENDOR,
    })

    const client = await clientFactory.makePrismaClient({
      createdByUserId: admin.id,
    })

    const productsPromises = [
      productFactory.makePrismaProduct({
        ownerId: admin.id,
      }),
      productFactory.makePrismaProduct({
        ownerId: admin.id,
      }),
    ]

    const [firstProduct, secondProduct] = await Promise.all(productsPromises)

    const cart = await cartFactory.makePrismaCart({
      clientId: client.id,
    })

    const cartItemsPromises = [
      cartItemFactory.makePrismaCartItem({
        cartId: cart.id,
        productId: firstProduct.id,
        quantity: 5,
      }),
      cartItemFactory.makePrismaCartItem({
        cartId: cart.id,
        productId: secondProduct.id,
        quantity: 10,
      }),
    ]

    await Promise.all(cartItemsPromises)

    const accessToken = makeAccessToken({
      sub: vendor.id.toString(),
      role: 'VENDOR',
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .patch(`/carts/${cart.id.toString()}/finish`)
      .set('Authorization', `Bearer ${accessToken}`)

    const cartOnDatabase = await prisma.cart.findUnique({
      where: {
        id: cart.id.toString(),
      },
    })

    expect(cartOnDatabase).toBeNull()

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      order: expect.objectContaining({
        id: expect.any(String),
        status: OrderStatus.PROCESSING,
        vendorId: vendor.id.toString(),
        clientId: client.id.toString(),
        totalPrice:
          firstProduct.price.toNumber() * 5 +
          secondProduct.price.toNumber() * 10,
      }),
    })
  })
})
