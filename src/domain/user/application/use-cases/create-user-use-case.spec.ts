import { faker } from '@faker-js/faker'
import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'

import { CreateUserUseCase } from './create-user-use-case'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let fakeHasher: FakeHasher

let sut: CreateUserUseCase

describe('Create User Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeHasher = new FakeHasher()
    sut = new CreateUserUseCase(inMemoryUsersRepository, fakeHasher)
  })

  const userData = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }

  it('should be able to create a new user', async () => {
    const result = await sut.execute(userData)

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items).toHaveLength(1)
    expect(inMemoryUsersRepository.items[0]).toMatchObject({
      email: userData.email,
    })
  })

  it('should not be able to create a new user with an email that already exists', async () => {
    const user = makeUser(userData)
    inMemoryUsersRepository.save(user)

    await sut.execute(userData)
    const result = await sut.execute(userData)

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
