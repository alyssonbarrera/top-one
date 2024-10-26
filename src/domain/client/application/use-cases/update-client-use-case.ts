import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { isEmailValid } from '@/utils/is-email-valid'

import { Client, ClientProps } from '../../enterprise/entities/client'
import { ClientsRepository } from '../repositories/clients-repository'

import { ClientAlreadyExistsError } from './errors/client-already-exists-error'
import { ClientNotFoundError } from './errors/client-not-found-error'
import { InvalidEmailError } from './errors/invalid-email-error'

interface UpdateClientUseCaseRequest
  extends Omit<
    Partial<ClientProps>,
    'createdAt' | 'updatedAt' | 'createdByUserId'
  > {
  id: string

  currentUser: UserPayload
}

type UpdateClientUseCaseResponse = Either<
  | ForbiddenError
  | ClientNotFoundError
  | ClientAlreadyExistsError
  | InvalidEmailError,
  {
    client: Client
  }
>

@Injectable()
export class UpdateClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({
    id,
    name,
    email,
    phone,
    address,
    currentUser,
  }: UpdateClientUseCaseRequest): Promise<UpdateClientUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    if (cannot('update', 'Client')) {
      return left(new ForbiddenError('update', 'client'))
    }

    if (email && !isEmailValid(email)) {
      return left(new InvalidEmailError())
    }

    const client = await this.clientsRepository.findById(id)

    if (!client) {
      return left(new ClientNotFoundError())
    }

    if (email) {
      const clientWithSameEmail =
        await this.clientsRepository.findByEmail(email)

      if (clientWithSameEmail && !clientWithSameEmail.id.equals(client.id)) {
        return left(new ClientAlreadyExistsError())
      }

      client.email = email
    }

    client.name = name ?? client.name
    client.phone = phone ?? client.phone
    client.address = address ?? client.address
    client.updatedAt = new Date()

    await this.clientsRepository.update(client)

    return right({
      client,
    })
  }
}
