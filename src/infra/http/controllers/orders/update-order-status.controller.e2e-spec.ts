import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'

import { makeAccessToken } from '@test/factories/make-access-token'
import { OrderFactory } from '@test/factories/make-order'
import { SendGridServiceMock } from '@test/services/sendgrid-service-mock'
import request from 'supertest'

import { OrderStatus } from '@/core/enums/order-status'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { MailModule } from '@/infra/mail/mail.module'
import { MailService } from '@/infra/mail/mail.service'

describe('Update Order Status (E2E)', () => {
  let app: INestApplication
  let ordersFactory: OrderFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, MailModule],
      providers: [OrderFactory],
    })
      .overrideProvider(MailService)
      .useClass(SendGridServiceMock)
      .compile()

    app = moduleRef.createNestApplication()

    ordersFactory = moduleRef.get(OrderFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PATCH] /orders/:id/status', async () => {
    const order = await ordersFactory.makePrismaOrder()

    const accessToken = makeAccessToken({
      sub: order.vendorId.toString(),
      role: 'VENDOR',
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id.toString()}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: OrderStatus.SENT,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        order: expect.objectContaining({
          id: expect.any(String),
          status: OrderStatus.SENT,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          totalPrice: order.totalPrice.toNumber(),
        }),
      }),
    )
  })
})
