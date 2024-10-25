import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserRole } from '@/core/enums/user-role'
import { Optional } from '@/core/types/optional'

export interface UserProps {
  name: string
  email: string
  password: string

  role: UserRole

  createdAt: Date
  updatedAt: Date | null
}

export class User extends Entity<UserProps> {
  get name() {
    return this.props.name
  }

  set name(name: string) {
    this.props.name = name
  }

  get email() {
    return this.props.email
  }

  set email(email: string) {
    this.props.email = email
  }

  get password() {
    return this.props.password
  }

  set password(password: string) {
    this.props.password = password
  }

  get role() {
    return this.props.role
  }

  set role(role: UserRole) {
    this.props.role = role
  }

  get createdAt() {
    return this.props.createdAt
  }

  set createdAt(createdAt: Date) {
    this.props.createdAt = createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set updatedAt(updatedAt: Date | null) {
    this.props.updatedAt = updatedAt
  }

  static create(
    props: Optional<UserProps, 'role' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    const user = new User(
      {
        ...props,
        role: props.role ?? UserRole.VENDOR,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    )

    return user
  }
}
