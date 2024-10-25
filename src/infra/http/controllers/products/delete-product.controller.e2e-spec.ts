import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'

import { makeAccessToken } from '@test/factories/make-access-token'
import { ProductFactory } from '@test/factories/make-product'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Delete Product (E2E)', () => {
  let app: INestApplication
  let productsFactory: ProductFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [ProductFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    productsFactory = moduleRef.get(ProductFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[DELETE] /products/:id', async () => {
    const product = await productsFactory.makePrismaProduct()

    const accessToken = makeAccessToken({
      sub: product.ownerId.toString(),
      role: 'ADMIN',
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .delete(`/products/${product.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(204)
  })
})
