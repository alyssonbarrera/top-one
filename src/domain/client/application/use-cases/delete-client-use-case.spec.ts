import { makeClient } from '@test/factories/make-client'
import { makeUser } from '@test/factories/make-user'
import { InMemoryClientsRepository } from '@test/repositories/in-memory-clients-repository'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { DeleteClientUseCase } from './delete-client-use-case'
import { ClientNotFoundError } from './errors/client-not-found-error'

let inMemoryClientsRepository: InMemoryClientsRepository
let sut: DeleteClientUseCase

describe('Delete Client Use Case', () => {
  beforeEach(() => {
    inMemoryClientsRepository = new InMemoryClientsRepository()

    sut = new DeleteClientUseCase(inMemoryClientsRepository)
  })

  const defaultUser = makeUser()
  const currentUser = {
    sub: defaultUser.id.toString(),
    role: UserRole.ADMIN,
  }

  it('should be able to delete a client', async () => {
    const client = makeClient({
      createdByUserId: defaultUser.id,
    })

    inMemoryClientsRepository.items.push(client)

    const result = await sut.execute({
      id: client.id.toString(),
      currentUser,
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryClientsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a client with a non-admin user', async () => {
    const client = makeClient({
      createdByUserId: defaultUser.id,
    })

    inMemoryClientsRepository.items.push(client)

    const result = await sut.execute({
      id: client.id.toString(),
      currentUser: {
        sub: defaultUser.id.toString(),
        role: UserRole.VENDOR,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })

  it('should not be able to delete a product that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
      currentUser,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ClientNotFoundError)
  })
})
