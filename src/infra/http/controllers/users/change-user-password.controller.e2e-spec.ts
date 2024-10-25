import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'

import { makeAccessToken } from '@test/factories/make-access-token'
import { UserFactory } from '@test/factories/make-user'
import { hash } from 'bcryptjs'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DEFAULT_SALT_ROUNDS } from '@/infra/auth/security'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Change Password (E2E)', () => {
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

  test('[PATCH] /users/:id/change-password', async () => {
    const userEmail = 'johndoe@example.com'
    const userPassword = '123456'
    const newPassword = '123456789'

    const password = await hash(userPassword, DEFAULT_SALT_ROUNDS)

    const makePrismaUserPromises = [
      userFactory.makePrismaUser({
        email: userEmail,
        password,
      }),
      userFactory.makePrismaUser({
        email: 'admin@acme.com',
        password,
      }),
    ]

    const [user, admin] = await Promise.all(makePrismaUserPromises)

    const accessToken = makeAccessToken({
      sub: admin.id.toString(),
      role: 'ADMIN',
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .patch(`/users/${user.id}/change-password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: userPassword,
        newPassword,
      })

    expect(response.statusCode).toBe(204)
  })
})
