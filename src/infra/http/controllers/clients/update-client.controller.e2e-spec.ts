import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'

import { faker } from '@faker-js/faker'
import { makeAccessToken } from '@test/factories/make-access-token'
import { ClientFactory } from '@test/factories/make-client'
import { UserFactory } from '@test/factories/make-user'
import request from 'supertest'

import { UserRole } from '@/core/enums/user-role'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Update Client (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let clientFactory: ClientFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, ClientFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    userFactory = moduleRef.get(UserFactory)
    clientFactory = moduleRef.get(ClientFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /clients/:id', async () => {
    const user = await userFactory.makePrismaUser({
      role: UserRole.ADMIN,
    })

    const client = await clientFactory.makePrismaClient({
      createdByUserId: user.id,
    })

    const accessToken = makeAccessToken({
      sub: user.id.toString(),
      role: 'ADMIN',
      service: jwt,
    })

    const updatedClientData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
    }

    const response = await request(app.getHttpServer())
      .put(`/clients/${client.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: updatedClientData.name,
        email: updatedClientData.email,
        address: updatedClientData.address,
        phone: updatedClientData.phone,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      client: expect.objectContaining({
        id: client.id.toString(),
        name: updatedClientData.name,
        email: updatedClientData.email,
        address: updatedClientData.address,
        phone: updatedClientData.phone,
        createdByUserId: user.id.toString(),
      }),
    })
  })
})
