import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'

import { faker } from '@faker-js/faker'
import { makeAccessToken } from '@test/factories/make-access-token'
import { UserFactory } from '@test/factories/make-user'
import request from 'supertest'

import { UserRole } from '@/core/enums/user-role'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Create Product (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    userFactory = moduleRef.get(UserFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /products', async () => {
    const userAdmin = await userFactory.makePrismaUser({
      role: UserRole.ADMIN,
    })

    const accessToken = makeAccessToken({
      sub: userAdmin.id.toString(),
      role: 'ADMIN',
      service: jwt,
    })

    const productData = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: 100,
    }

    const response = await request(app.getHttpServer())
      .post(`/products`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(productData)

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      product: expect.objectContaining({
        id: expect.any(String),
        name: productData.name,
        description: productData.description,
        price: productData.price,
        ownerId: userAdmin.id.toString(),
        discount: 0,
      }),
    })
  })
})
