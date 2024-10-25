import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'

import { makeAccessToken } from '@test/factories/make-access-token'
import { ClientFactory } from '@test/factories/make-client'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Delete Client (E2E)', () => {
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

  test('[DELETE] /clients/:id', async () => {
    const client = await clientsFactory.makePrismaClient()

    const accessToken = makeAccessToken({
      sub: client.id.toString(),
      role: 'ADMIN',
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .delete(`/clients/${client.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(204)
  })
})
