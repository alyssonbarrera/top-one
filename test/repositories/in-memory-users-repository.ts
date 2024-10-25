import { UsersRepository } from '@/domain/user/application/repositories/users-repository'
import { User } from '@/domain/user/enterprise/entities/user'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async save(User: User): Promise<User> {
    this.items.push(User)

    return User
  }

  async findByEmail(email: string) {
    return this.items.find((User) => User.email === email) || null
  }

  async findById(id: string) {
    return this.items.find((User) => User.id.toString() === id) || null
  }

  async update(User: User): Promise<User> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === User.id.toString(),
    )

    this.items[index] = User

    return User
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id)

    this.items.splice(index, 1)
  }
}
