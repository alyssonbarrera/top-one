import { ClientWithCreatedByUser } from '@/domain/client/enterprise/value-objects/client-with-created-by-user'

export class ClientWithCreatedByUserPresenter {
  static toHTTP(client: ClientWithCreatedByUser) {
    return {
      id: client.clientId.toString(),
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      createdByUserId: client.createdByUserId.toString(),
      createdBy: {
        id: client.createdBy.id.toString(),
        name: client.createdBy.name,
        email: client.createdBy.email,
      },
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    }
  }
}
