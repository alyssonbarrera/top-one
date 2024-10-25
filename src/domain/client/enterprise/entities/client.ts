import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface ClientProps {
  name: string
  email: string
  phone: string
  address: string

  createdByUserId: UniqueEntityID

  createdAt: Date
  updatedAt: Date | null
}

export class Client extends Entity<ClientProps> {
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

  get phone() {
    return this.props.phone
  }

  set phone(phone: string) {
    this.props.phone = phone
  }

  get address() {
    return this.props.address
  }

  set address(address: string) {
    this.props.address = address
  }

  get createdByUserId() {
    return this.props.createdByUserId
  }

  set createdByUserId(createdByUserId: UniqueEntityID) {
    this.props.createdByUserId = createdByUserId
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
    props: Optional<ClientProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    const client = new Client(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    )

    return client
  }
}
