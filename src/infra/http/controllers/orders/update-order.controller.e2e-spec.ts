import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'

import { Decimal } from '@prisma/client/runtime/library'
import { makeAccessToken } from '@test/factories/make-access-token'
import { ClientFactory } from '@test/factories/make-client'
import { OrderFactory } from '@test/factories/make-order'
import { ProductFactory } from '@test/factories/make-product'
import { UserFactory } from '@test/factories/make-user'
import { SendGridServiceMock } from '@test/services/sendgrid-service-mock'
import request from 'supertest'

import { OrderStatus } from '@/core/enums/order-status'
import { UserRole } from '@/core/enums/user-role'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { MailModule } from '@/infra/mail/mail.module'
import { MailService } from '@/infra/mail/mail.service'

describe('Update Order (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let orderFactory: OrderFactory
  let productFactory: ProductFactory
  let clientFactory: ClientFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, MailModule],
      providers: [OrderFactory, ClientFactory, UserFactory, ProductFactory],
    })
      .overrideProvider(MailService)
      .useClass(SendGridServiceMock)
      .compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    productFactory = moduleRef.get(ProductFactory)
    orderFactory = moduleRef.get(OrderFactory)
    clientFactory = moduleRef.get(ClientFactory)
    userFactory = moduleRef.get(UserFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /orders/:id', async () => {
    const admin = await userFactory.makePrismaUser({
      role: UserRole.ADMIN,
    })

    const productsPromises = [
      productFactory.makePrismaProduct({ ownerId: admin.id }),
      productFactory.makePrismaProduct({ ownerId: admin.id }),
    ]

    const client = await clientFactory.makePrismaClient({
      createdByUserId: admin.id,
    })

    const order = await orderFactory.makePrismaOrder({
      clientId: client.id,
      vendorId: admin.id,
    })

    const [productOne, productTwo] = await Promise.all(productsPromises)

    const orderItems = await prisma.orderItem.createManyAndReturn({
      data: [
        {
          orderId: order.id.toString(),
          productId: productOne.id.toString(),
          quantity: 2,
          price: productOne.price,
        },
        {
          orderId: order.id.toString(),
          productId: productTwo.id.toString(),
          quantity: 3,
          price: productTwo.price,
        },
      ],
    })

    const totalPrice = orderItems.reduce(
      (acc, item) => acc + item.price.toNumber() * item.quantity,
      0,
    )

    const accessToken = makeAccessToken({
      sub: order.vendorId.toString(),
      role: 'VENDOR',
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .put(`/orders/${order.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        clientId: client.id.toString(),
        status: OrderStatus.DELIVERED,
        items: orderItems.map((item) => ({
          productId: item.productId.toString(),
          quantity: item.quantity,
        })),
      })

    const orderWithItemsOnDatabase = await prisma.order.findUnique({
      where: { id: order.id.toString() },
      include: { orderItems: true },
    })

    expect(orderWithItemsOnDatabase).toEqual(
      expect.objectContaining({
        id: order.id.toString(),
        status: OrderStatus.DELIVERED,
        clientId: client.id.toString(),
        totalPrice: new Decimal(totalPrice),
      }),
    )

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        order: expect.objectContaining({
          id: expect.any(String),
          status: OrderStatus.DELIVERED,
          clientId: client.id.toString(),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          totalPrice,
        }),
      }),
    )
  })
})
