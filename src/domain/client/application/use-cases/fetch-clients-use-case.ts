import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { ClientWithCreatedByUser } from '../../enterprise/value-objects/client-with-created-by-user'
import { ClientsRepository } from '../repositories/clients-repository'

interface FetchClientsUseCaseRequest {
  currentUser: UserPayload
}

type FetchClientsUseCaseResponse = Either<
  ForbiddenError,
  {
    clients: ClientWithCreatedByUser[]
  }
>

@Injectable()
export class FetchClientsUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({
    currentUser,
  }: FetchClientsUseCaseRequest): Promise<FetchClientsUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    if (cannot('get', 'Client')) {
      return left(new ForbiddenError('get', 'client'))
    }

    const clients = await this.clientsRepository.findAll()

    return right({
      clients,
    })
  }
}
