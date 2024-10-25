import { makeClientWithCreatedByUser } from '@test/factories/make-client-with-created-by-user'
import { makeUser } from '@test/factories/make-user'
import { InMemoryClientsRepository } from '@test/repositories/in-memory-clients-repository'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ClientNotFoundError } from './errors/client-not-found-error'
import { GetClientByIdUseCase } from './get-client-by-id-use-case'

let inMemoryClientsRepository: InMemoryClientsRepository
let sut: GetClientByIdUseCase

describe('Get Client Use Case', () => {
  beforeEach(() => {
    inMemoryClientsRepository = new InMemoryClientsRepository()

    sut = new GetClientByIdUseCase(inMemoryClientsRepository)
  })

  const defaultUser = makeUser()
  const currentUser = {
    sub: defaultUser.id.toString(),
    role: UserRole.ADMIN,
  }

  it('should be able to get a client', async () => {
    const client = makeClientWithCreatedByUser({
      createdBy: defaultUser,
      createdByUserId: defaultUser.id,
    })
    inMemoryClientsRepository.itemsWithCreatedByUser.push(client)

    const result = await sut.execute({
      id: client.clientId.toString(),
      currentUser,
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryClientsRepository.itemsWithCreatedByUser).toHaveLength(1)
    expect(result.value).toEqual(
      expect.objectContaining({
        client: expect.objectContaining({
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          createdByUserId: client.createdByUserId,
          createdBy: expect.objectContaining({
            id: client.createdBy.id,
            name: client.createdBy.name,
            email: client.createdBy.email,
          }),
        }),
      }),
    )
  })

  it('should not be able to get a client with a non-admin user', async () => {
    const client = makeClientWithCreatedByUser({
      createdBy: defaultUser,
      createdByUserId: defaultUser.id,
    })
    inMemoryClientsRepository.itemsWithCreatedByUser.push(client)

    const result = await sut.execute({
      id: client.clientId.toString(),
      currentUser: {
        sub: defaultUser.id.toString(),
        role: UserRole.VENDOR,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })

  it('should not be able to get a client that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existing-id',
      currentUser,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ClientNotFoundError)
  })
})
