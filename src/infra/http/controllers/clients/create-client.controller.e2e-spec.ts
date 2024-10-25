import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'

import { makeAccessToken } from '@test/factories/make-access-token'
import { makeClient } from '@test/factories/make-client'
import { UserFactory } from '@test/factories/make-user'
import request from 'supertest'

import { UserRole } from '@/core/enums/user-role'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Create Client (E2E)', () => {
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

  test('[POST] /clients', async () => {
    const userAdmin = await userFactory.makePrismaUser({
      role: UserRole.ADMIN,
    })

    const accessToken = makeAccessToken({
      sub: userAdmin.id.toString(),
      role: 'ADMIN',
      service: jwt,
    })

    const clientData = makeClient({
      createdByUserId: userAdmin.id,
    })

    const response = await request(app.getHttpServer())
      .post(`/clients`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: clientData.name,
        email: clientData.email,
        address: clientData.address,
        phone: clientData.phone,
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      client: expect.objectContaining({
        id: expect.any(String),
        name: clientData.name,
        email: clientData.email,
        address: clientData.address,
        phone: clientData.phone,
        createdByUserId: userAdmin.id.toString(),
      }),
    })
  })
})
