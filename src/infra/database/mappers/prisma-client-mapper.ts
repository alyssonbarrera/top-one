import { Client as PrismaClient } from '@prisma/client'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Client } from '@/domain/client/enterprise/entities/client'

export class PrismaClientMapper {
  static toDomain(client: PrismaClient): Client {
    return Client.create(
      {
        name: client.name,
        email: client.email,
        address: client.address,
        phone: client.phone,
        createdByUserId: new UniqueEntityID(client.createdByUserId),
        createdAt: client.createdAt,
        updatedAt: client.updatedAt ?? null,
      },
      new UniqueEntityID(client.id),
    )
  }

  static toPrisma(client: Client): PrismaClient {
    return {
      id: client.id.toString(),
      name: client.name,
      email: client.email,
      address: client.address,
      phone: client.phone,
      createdByUserId: client.createdByUserId.toString(),
      createdAt: client.createdAt,
      updatedAt: client.updatedAt ?? null,
    }
  }
}
