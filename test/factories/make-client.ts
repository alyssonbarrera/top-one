import { Injectable } from '@nestjs/common'

import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserRole } from '@/core/enums/user-role'

import { Client, ClientProps } from '@/domain/client/enterprise/entities/client'
import { PrismaClientMapper } from '@/infra/database/mappers/prisma-client-mapper'
import { PrismaUserMapper } from '@/infra/database/mappers/prisma-user-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

import { makeUser } from './make-user'

export function makeClient(
  override: Partial<ClientProps>,
  id?: UniqueEntityID,
) {
  const client = Client.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      phone: faker.phone.number(),
      createdByUserId: new UniqueEntityID(),
      ...override,
    },
    id,
  )

  return client
}

@Injectable()
export class ClientFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaClient(data: Partial<ClientProps> = {}) {
    const user = makeUser({
      role: UserRole.ADMIN,
    })
    const client = makeClient({
      createdByUserId: user.id,
      ...data,
    })

    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    })

    await this.prisma.client.create({
      data: PrismaClientMapper.toPrisma(client),
    })

    return client
  }
}
