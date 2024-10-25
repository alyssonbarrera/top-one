import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'

import { makeAccessToken } from '@test/factories/make-access-token'
import { ClientFactory } from '@test/factories/make-client'
import { ProductFactory } from '@test/factories/make-product'
import { UserFactory } from '@test/factories/make-user'
import request from 'supertest'

import { UserRole } from '@/core/enums/user-role'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Add Products to Cart (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let clientFactory: ClientFactory
  let productFactory: ProductFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, ClientFactory, ProductFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    userFactory = moduleRef.get(UserFactory)
    clientFactory = moduleRef.get(ClientFactory)
    productFactory = moduleRef.get(ProductFactory)

    jwt = moduleRef.get(JwtService)

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

    const firstProduct = await productFactory.makePrismaProduct({
      ownerId: admin.id,
    })

    const secondProduct = await productFactory.makePrismaProduct({
      ownerId: admin.id,
    })

    const accessToken = makeAccessToken({
      sub: vendor.id.toString(),
      role: 'VENDOR',
      service: jwt,
    })

    const cartData = {
      products: [
        {
          productId: firstProduct.id.toString(),
          quantity: 5,
        },
        {
          productId: secondProduct.id.toString(),
          quantity: 10,
        },
      ],
    }

    const response = await request(app.getHttpServer())
      .post(`/clients/${client.id.toString()}/cart`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(cartData)

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      cart: expect.objectContaining({
        id: expect.any(String),
        clientId: client.id.toString(),
        totalPrice:
          firstProduct.price.toNumber() * 5 +
          secondProduct.price.toNumber() * 10,
      }),
    })
    expect(response.body).not.toHaveProperty('notFoundProducts')
  })
})
