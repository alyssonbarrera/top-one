import { Client } from '@/domain/client/enterprise/entities/client'

export class ClientPresenter {
  static toHTTP(client: Client) {
    return {
      id: client.id.toString(),
      name: client.name,
      email: client.email,
      address: client.address,
      phone: client.phone,
      createdByUserId: client.createdByUserId.toString(),
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    }
  }
}
