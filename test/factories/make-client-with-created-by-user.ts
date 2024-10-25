import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import {
  ClientWithCreatedByUser,
  ClientWithCreatedByUserProps,
} from '@/domain/client/enterprise/value-objects/client-with-created-by-user'

export function makeClientWithCreatedByUser(
  override: Partial<ClientWithCreatedByUserProps>,
) {
  const client = ClientWithCreatedByUser.create({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    address: faker.location.streetAddress(),
    phone: faker.phone.number(),
    createdByUserId: new UniqueEntityID(),
    clientId: new UniqueEntityID(),
    createdBy: {
      id: new UniqueEntityID(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
    },
    createdAt: new Date(),
    ...override,
  })

  return client
}
