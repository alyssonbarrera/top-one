import { faker } from '@faker-js/faker'
import { makeClient } from '@test/factories/make-client'
import { makeUser } from '@test/factories/make-user'
import { InMemoryClientsRepository } from '@test/repositories/in-memory-clients-repository'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { CreateClientUseCase } from './create-client-use-case'
import { ClientAlreadyExistsError } from './errors/client-already-exists-error'

let inMemoryClientsRepository: InMemoryClientsRepository
let sut: CreateClientUseCase

describe('Create Client Use Case', () => {
  beforeEach(() => {
    inMemoryClientsRepository = new InMemoryClientsRepository()

    sut = new CreateClientUseCase(inMemoryClientsRepository)
  })

  const defaultVendor = makeUser()
  const defaultClientData = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.address.streetAddress(),
  }
  const currentUser = {
    sub: defaultVendor.id.toString(),
    role: UserRole.ADMIN,
  }

  it('should be able to create a client', async () => {
    const data = {
      ...defaultClientData,
      currentUser,
    }

    const result = await sut.execute(data)

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryClientsRepository.items).toHaveLength(1)
    expect(inMemoryClientsRepository.items[0]).toEqual(
      expect.objectContaining({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        createdByUserId: defaultVendor.id,
      }),
    )
  })

  it('should not be able to create a client with a non-admin user', async () => {
    const data = {
      ...defaultClientData,
      currentUser: {
        sub: defaultVendor.id.toString(),
        role: UserRole.VENDOR,
      },
    }

    const result = await sut.execute(data)

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })

  it('should not be able to create a client with an email that already exists', async () => {
    const client = makeClient(defaultClientData)
    inMemoryClientsRepository.save(client)

    const data = {
      ...defaultClientData,
      currentUser,
    }

    await sut.execute(data)
    const result = await sut.execute(data)

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ClientAlreadyExistsError)
  })
})
