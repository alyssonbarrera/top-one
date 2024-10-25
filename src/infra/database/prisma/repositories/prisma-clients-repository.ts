import { Injectable } from '@nestjs/common'

import { ClientsRepository } from '@/domain/client/application/repositories/clients-repository'
import { Client } from '@/domain/client/enterprise/entities/client'

import { PrismaClientMapper } from '../../mappers/prisma-client-mapper'
import { PrismaClientWithCreatedByUserMapper } from '../../mappers/prisma-client-with-created-by-user-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaClientsRepository implements ClientsRepository {
  constructor(private prisma: PrismaService) {}

  async save(data: Client) {
    const client = await this.prisma.client.create({
      data: PrismaClientMapper.toPrisma(data),
    })

    return PrismaClientMapper.toDomain(client)
  }

  async findAll() {
    const clients = await this.prisma.client.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return clients.map(PrismaClientWithCreatedByUserMapper.toDomain)
  }

  async findByEmail(email: string) {
    const client = await this.prisma.client.findUnique({
      where: { email },
    })

    if (!client) {
      return null
    }

    return PrismaClientMapper.toDomain(client)
  }

  async findById(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    })

    if (!client) {
      return null
    }

    return PrismaClientMapper.toDomain(client)
  }

  async findByIdWithCreatedByUser(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!client) {
      return null
    }

    return PrismaClientWithCreatedByUserMapper.toDomain(client)
  }

  async update(data: Client) {
    const client = await this.prisma.client.update({
      where: { id: data.id.toString() },
      data: PrismaClientMapper.toPrisma(data),
    })

    return PrismaClientMapper.toDomain(client)
  }

  async delete(id: string) {
    await this.prisma.client.delete({
      where: { id },
    })
  }
}
