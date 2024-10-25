import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { User } from '../../enterprise/entities/user'
import { HashComparer } from '../cryptography/hash-comparer'
import { HashGenerator } from '../cryptography/hash-generator'
import { UsersRepository } from '../repositories/users-repository'

import { UserNotFoundError } from './errors/user-not-found-error'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

interface ChangeUserPasswordUseCaseRequest {
  id: string
  newPassword: string
  currentPassword: string
  currentUser: UserPayload
}

type ChangeUserPasswordUseCaseResponse = Either<
  UserNotFoundError | WrongCredentialsError | ForbiddenError,
  {
    user: User
  }
>

@Injectable()
export class ChangeUserPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
    private hashComparer: HashComparer,
  ) {}

  async execute({
    id,
    currentUser,
    newPassword,
    currentPassword,
  }: ChangeUserPasswordUseCaseRequest): Promise<ChangeUserPasswordUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    if (cannot('change-password', 'User')) {
      return left(new ForbiddenError('change password', 'User'))
    }

    const user = await this.usersRepository.findById(id)

    if (!user) {
      return left(new UserNotFoundError())
    }

    const isCurrentPasswordValid = await this.hashComparer.compare(
      currentPassword,
      user.password,
    )

    if (!isCurrentPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const hashedNewPassword = await this.hashGenerator.hash(newPassword)

    user.password = hashedNewPassword
    await this.usersRepository.update(user)

    return right({
      user,
    })
  }
}
