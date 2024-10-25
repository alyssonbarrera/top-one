import { User } from '../../enterprise/entities/user'

export abstract class UsersRepository {
  abstract save(data: User): Promise<User>
  abstract findByEmail(email: string): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
  abstract update(data: User): Promise<User>
  abstract delete(id: string): Promise<void>
}
