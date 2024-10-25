import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'

import { makeAccessToken } from '@test/factories/make-access-token'
import { ClientFactory } from '@test/factories/make-client'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Fetch Clients (E2E)', () => {
  let app: INestApplication
  let clientsFactory: ClientFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [ClientFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    clientsFactory = moduleRef.get(ClientFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /clients', async () => {
    const client = await clientsFactory.makePrismaClient()

    const accessToken = makeAccessToken({
      sub: client.createdByUserId.toString(),
      role: 'ADMIN',
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .get(`/clients`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      clients: expect.arrayContaining([
        expect.objectContaining({
          id: client.id.toString(),
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          createdByUserId: client.createdByUserId.toString(),
          createdBy: expect.objectContaining({
            id: client.createdByUserId.toString(),
            name: expect.any(String),
            email: expect.any(String),
          }),
        }),
      ]),
    })
  })
})
