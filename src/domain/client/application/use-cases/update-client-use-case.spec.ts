import { faker } from '@faker-js/faker'
import { makeClient } from '@test/factories/make-client'
import { makeUser } from '@test/factories/make-user'
import { InMemoryClientsRepository } from '@test/repositories/in-memory-clients-repository'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ClientAlreadyExistsError } from './errors/client-already-exists-error'
import { ClientNotFoundError } from './errors/client-not-found-error'
import { InvalidEmailError } from './errors/invalid-email-error'
import { UpdateClientUseCase } from './update-client-use-case'

let inMemoryClientsRepository: InMemoryClientsRepository
let sut: UpdateClientUseCase

describe('Update Client Use Case', () => {
  beforeEach(() => {
    inMemoryClientsRepository = new InMemoryClientsRepository()

    sut = new UpdateClientUseCase(inMemoryClientsRepository)
  })

  const defaultUser = makeUser()
  const currentUser = {
    sub: defaultUser.id.toString(),
    role: UserRole.ADMIN,
  }
  const defaultUpdatedClient = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
  }

  it('should be able to update a client', async () => {
    const client = makeClient({
      createdByUserId: defaultUser.id,
    })

    inMemoryClientsRepository.items.push(client)

    const result = await sut.execute({
      id: client.id.toString(),
      currentUser,
      ...defaultUpdatedClient,
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryClientsRepository.items).toHaveLength(1)
    expect(inMemoryClientsRepository.items[0]).toEqual(
      expect.objectContaining({
        name: defaultUpdatedClient.name,
        email: defaultUpdatedClient.email,
        phone: defaultUpdatedClient.phone,
        address: defaultUpdatedClient.address,
        createdByUserId: client.createdByUserId,
      }),
    )
  })

  it('should not be able to update a client with a non-admin user', async () => {
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
      ...defaultUpdatedClient,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })

  it('should not be able to update a client with an invalid email', async () => {
    const client = makeClient({
      createdByUserId: defaultUser.id,
    })

    inMemoryClientsRepository.items.push(client)

    const result = await sut.execute({
      id: client.id.toString(),
      currentUser,
      ...defaultUpdatedClient,
      email: 'invalid-email',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidEmailError)
  })

  it('should not be able to update a client that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existing-client-id',
      currentUser,
      ...defaultUpdatedClient,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ClientNotFoundError)
  })

  it('should not be able to update a client with an email that already exists when the email is different from the current client', async () => {
    const client = makeClient({
      createdByUserId: defaultUser.id,
    })

    inMemoryClientsRepository.items.push(client)

    const clientWithSameEmail = makeClient({
      email: defaultUpdatedClient.email,
      createdByUserId: defaultUser.id,
    })

    inMemoryClientsRepository.items.push(clientWithSameEmail)

    const result = await sut.execute({
      id: client.id.toString(),
      currentUser,
      ...defaultUpdatedClient,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ClientAlreadyExistsError)
  })
})
