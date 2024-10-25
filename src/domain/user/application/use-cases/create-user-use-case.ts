import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'

import { User } from '../../enterprise/entities/user'
import { HashGenerator } from '../cryptography/hash-generator'
import { UsersRepository } from '../repositories/users-repository'

import { UserAlreadyExistsError } from './errors/user-already-exists-error'

interface CreateUserUseCaseRequest {
  name: string
  email: string
  password: string
}

type CreateUserUseCaseResponse = Either<
  UserAlreadyExistsError,
  {
    user: User
  }
>

@Injectable()
export class CreateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    email,
    password,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userAlreadyExists = await this.usersRepository.findByEmail(email)

    if (userAlreadyExists) {
      return left(new UserAlreadyExistsError())
    }

    const hashedPassword = await this.hashGenerator.hash(password)

    const user = User.create({
      name,
      email,
      password: hashedPassword,
    })

    await this.usersRepository.save(user)

    return right({
      user,
    })
  }
}
