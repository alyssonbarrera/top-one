import { Injectable } from '@nestjs/common'

import { UsersRepository } from '@/domain/user/application/repositories/users-repository'
import { User } from '@/domain/user/enterprise/entities/user'

import { PrismaUserMapper } from '../../mappers/prisma-user-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async save(data: User) {
    const user = await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(data),
    })

    return PrismaUserMapper.toDomain(user)
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async update(data: User) {
    const user = await this.prisma.user.update({
      where: { id: data.id.toString() },
      data: PrismaUserMapper.toPrisma(data),
    })

    return PrismaUserMapper.toDomain(user)
  }

  async delete(id: string) {
    await this.prisma.user.delete({
      where: { id },
    })
  }
}
