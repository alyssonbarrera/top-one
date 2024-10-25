import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { Client, ClientProps } from '../../enterprise/entities/client'
import { ClientsRepository } from '../repositories/clients-repository'

import { ClientAlreadyExistsError } from './errors/client-already-exists-error'

interface CreateClientUseCaseRequest
  extends Omit<ClientProps, 'createdAt' | 'updatedAt' | 'createdByUserId'> {
  currentUser: UserPayload
}

type CreateClientUseCaseResponse = Either<
  ForbiddenError | ClientAlreadyExistsError,
  {
    client: Client
  }
>

@Injectable()
export class CreateClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({
    name,
    email,
    phone,
    address,
    currentUser,
  }: CreateClientUseCaseRequest): Promise<CreateClientUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    if (cannot('create', 'Client')) {
      return left(new ForbiddenError('create', 'client'))
    }

    const clientWithSameEmail = await this.clientsRepository.findByEmail(email)

    if (clientWithSameEmail) {
      return left(new ClientAlreadyExistsError())
    }

    const client = Client.create({
      name,
      email,
      phone,
      address,
      createdByUserId: new UniqueEntityID(currentUser.sub),
    })

    await this.clientsRepository.save(client)

    return right({
      client,
    })
  }
}
