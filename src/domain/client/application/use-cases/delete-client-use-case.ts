import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { ClientsRepository } from '../repositories/clients-repository'

import { ClientNotFoundError } from './errors/client-not-found-error'

interface DeleteClientUseCaseRequest {
  id: string
  currentUser: UserPayload
}

type DeleteClientUseCaseResponse = Either<
  ForbiddenError | ClientNotFoundError,
  null
>

@Injectable()
export class DeleteClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({
    id,
    currentUser,
  }: DeleteClientUseCaseRequest): Promise<DeleteClientUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    if (cannot('delete', 'Client')) {
      return left(new ForbiddenError('delete', 'client'))
    }

    const client = await this.clientsRepository.findById(id)

    if (!client) {
      return left(new ClientNotFoundError())
    }

    await this.clientsRepository.delete(client.id.toString())

    return right(null)
  }
}
