import { makeClientWithCreatedByUser } from '@test/factories/make-client-with-created-by-user'
import { makeUser } from '@test/factories/make-user'
import { InMemoryClientsRepository } from '@test/repositories/in-memory-clients-repository'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { FetchClientsUseCase } from './fetch-clients-use-case'

let inMemoryClientsRepository: InMemoryClientsRepository
let sut: FetchClientsUseCase

describe('Get Client Use Case', () => {
  beforeEach(() => {
    inMemoryClientsRepository = new InMemoryClientsRepository()

    sut = new FetchClientsUseCase(inMemoryClientsRepository)
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

    const maxClients = 10
    for (let index = 0; index < maxClients; index++) {
      inMemoryClientsRepository.itemsWithCreatedByUser.push(client)
    }

    const result = await sut.execute({
      currentUser,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        clients: expect.arrayContaining([
          expect.objectContaining({
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
        ]),
      }),
    )
  })

  it('should not be able to get a client with a non-admin user', async () => {
    const client = makeClientWithCreatedByUser({
      createdBy: defaultUser,
      createdByUserId: defaultUser.id,
    })

    const maxClients = 10
    for (let index = 0; index < maxClients; index++) {
      inMemoryClientsRepository.itemsWithCreatedByUser.push(client)
    }

    const result = await sut.execute({
      currentUser: {
        sub: defaultUser.id.toString(),
        role: UserRole.VENDOR,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })
})
