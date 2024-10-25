import { User as PrismaUser } from '@prisma/client'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserRole } from '@/core/enums/user-role'

import { User } from '@/domain/user/enterprise/entities/user'

export class PrismaUserMapper {
  static toDomain(user: PrismaUser): User {
    return User.create(
      {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role as UserRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt ?? null,
      },
      new UniqueEntityID(user.id),
    )
  }

  static toPrisma(user: User): PrismaUser {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
