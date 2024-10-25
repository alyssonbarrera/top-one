import { Client as PrismaClient, User as PrismaUser } from '@prisma/client'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { ClientWithCreatedByUser } from '@/domain/client/enterprise/value-objects/client-with-created-by-user'

type PrismaClientWithCreatedByUser = PrismaClient & {
  createdBy: Pick<PrismaUser, 'id' | 'name' | 'email'>
}

export class PrismaClientWithCreatedByUserMapper {
  static toDomain(
    client: PrismaClientWithCreatedByUser,
  ): ClientWithCreatedByUser {
    return ClientWithCreatedByUser.create({
      name: client.name,
      email: client.email,
      address: client.address,
      phone: client.phone,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt ?? null,
      createdByUserId: new UniqueEntityID(client.createdByUserId),
      clientId: new UniqueEntityID(client.id),
      createdBy: {
        id: new UniqueEntityID(client.createdBy.id),
        name: client.createdBy.name,
        email: client.createdBy.email,
      },
    })
  }
}
