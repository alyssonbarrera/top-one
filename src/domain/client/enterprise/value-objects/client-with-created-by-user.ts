import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'
import { Optional } from '@/core/types/optional'

import { ClientProps } from '../entities/client'

export interface ClientWithCreatedByUserProps
  extends Optional<ClientProps, 'updatedAt'> {
  clientId: UniqueEntityID
  createdByUserId: UniqueEntityID
  createdBy: {
    id: UniqueEntityID
    name: string
    email: string
  }
}

export class ClientWithCreatedByUser extends ValueObject<ClientWithCreatedByUserProps> {
  get clientId() {
    return this.props.clientId
  }

  get createdByUserId() {
    return this.props.createdByUserId
  }

  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get phone() {
    return this.props.phone
  }

  get address() {
    return this.props.address
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get createdBy() {
    return this.props.createdBy
  }

  public static create(props: ClientWithCreatedByUserProps) {
    return new ClientWithCreatedByUser(props)
  }
}
