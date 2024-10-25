import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'

import { makeAccessToken } from '@test/factories/make-access-token'
import { OrderFactory } from '@test/factories/make-order'
import request from 'supertest'

import { OrderStatus } from '@/core/enums/order-status'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Fetch Orders (E2E)', () => {
  let app: INestApplication
  let ordersFactory: OrderFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [OrderFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    ordersFactory = moduleRef.get(OrderFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /orders', async () => {
    const order = await ordersFactory.makePrismaOrder()

    const accessToken = makeAccessToken({
      sub: order.vendorId.toString(),
      role: 'VENDOR',
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .get(`/orders`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        orders: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            status: 'PROCESSING',
            vendor: {
              id: order.vendorId.toString(),
              name: expect.any(String),
              email: expect.any(String),
            },
            client: {
              id: order.clientId.toString(),
              name: expect.any(String),
              email: expect.any(String),
            },
            createdAt: expect.any(String),
            updatedAt: null,
            totalPrice: order.totalPrice.toNumber(),
          }),
        ]),
      }),
    )
  })

  test('[GET] /orders?status=SENT', async () => {
    const orderWithSentStatus = await ordersFactory.makePrismaOrder({
      status: OrderStatus.SENT,
    })
    await ordersFactory.makePrismaOrder({
      status: OrderStatus.PROCESSING,
    })

    const accessToken = makeAccessToken({
      sub: orderWithSentStatus.vendorId.toString(),
      role: 'VENDOR',
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .get(`/orders?status=SENT`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        orders: expect.arrayContaining([
          expect.objectContaining({
            status: 'SENT',
          }),
        ]),
      }),
    )
    expect(response.body).toEqual(
      expect.not.objectContaining({
        orders: expect.arrayContaining([
          expect.objectContaining({
            status: 'PROCESSING',
          }),
        ]),
      }),
    )
  })
})