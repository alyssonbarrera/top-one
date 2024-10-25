import { faker } from '@faker-js/faker'
import { FakeEncrypter } from '@test/cryptography/fake-encrypter'
import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'

import { AuthenticateUserUseCase } from './authenticate-user-use-case'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let fakeHasher: FakeHasher
let encrypter: FakeEncrypter
let sut: AuthenticateUserUseCase

describe('Authenticate User Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeHasher = new FakeHasher()
    encrypter = new FakeEncrypter()

    sut = new AuthenticateUserUseCase(
      inMemoryUsersRepository,
      fakeHasher,
      encrypter,
    )
  })

  const generateUserData = async () => ({
    email: faker.internet.email(),
    password: await fakeHasher.hash('123456'),
  })

  it('should be able to authenticate a user', async () => {
    const userData = await generateUserData()
    const user = makeUser(userData)
    inMemoryUsersRepository.save(user)

    const result = await sut.execute({
      ...userData,
      password: '123456',
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items).toHaveLength(1)
    expect(inMemoryUsersRepository.items[0]).toMatchObject({
      email: userData.email,
      password: userData.password,
    })
  })

  it('should not be able to authenticate a user with wrong credentials', async () => {
    const userData = await generateUserData()
    const user = makeUser(userData)
    inMemoryUsersRepository.save(user)

    const result = await sut.execute({
      ...userData,
      password: 'wrong-password',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })
})
