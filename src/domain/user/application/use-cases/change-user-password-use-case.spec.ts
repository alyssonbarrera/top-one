import { faker } from '@faker-js/faker'
import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'

import { UserRole } from '@/core/enums/user-role'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ChangeUserPasswordUseCase } from './change-user-password-use-case'
import { UserNotFoundError } from './errors/user-not-found-error'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let fakeHasher: FakeHasher

let sut: ChangeUserPasswordUseCase

describe('Change User Password Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeHasher = new FakeHasher()

    sut = new ChangeUserPasswordUseCase(
      inMemoryUsersRepository,
      fakeHasher,
      fakeHasher,
    )
  })

  const currentPassword = '123456'
  const newPassword = '123456789'

  const generateUserData = async () => ({
    email: faker.internet.email(),
    password: await fakeHasher.hash('123456'),
  })

  it('should be able to change a user password', async () => {
    const userData = await generateUserData()
    const user = makeUser({
      ...userData,
      role: UserRole.ADMIN,
    })
    inMemoryUsersRepository.save(user)

    const result = await sut.execute({
      id: user.id.toString(),
      currentUser: {
        sub: user.id.toString(),
        role: UserRole.ADMIN,
      },
      newPassword,
      currentPassword,
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items).toHaveLength(1)
    expect(inMemoryUsersRepository.items[0]).toMatchObject({
      email: userData.email,
    })
  })

  it('should not be able to change a user password when the user is not found', async () => {
    const userData = await generateUserData()
    const user = makeUser(userData)
    inMemoryUsersRepository.save(user)

    const result = await sut.execute({
      id: faker.string.uuid(),
      currentUser: {
        sub: user.id.toString(),
        role: UserRole.ADMIN,
      },
      newPassword,
      currentPassword,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })

  it('should not be able to change a user password when the current password is wrong', async () => {
    const userData = await generateUserData()
    const user = makeUser({
      ...userData,
      role: UserRole.ADMIN,
    })
    inMemoryUsersRepository.save(user)

    const result = await sut.execute({
      id: user.id.toString(),
      currentUser: {
        sub: user.id.toString(),
        role: UserRole.ADMIN,
      },
      newPassword,
      currentPassword: 'wrong-password',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('should not be able to change a user password when the user does not have permission', async () => {
    const userData = await generateUserData()
    const user = makeUser(userData)
    inMemoryUsersRepository.save(user)

    const result = await sut.execute({
      id: user.id.toString(),
      currentUser: {
        sub: user.id.toString(),
        role: UserRole.VENDOR,
      },
      newPassword,
      currentPassword,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ForbiddenError)
  })
})
