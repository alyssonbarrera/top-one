import { ClientsRepository } from '@/domain/client/application/repositories/clients-repository'
import { Client } from '@/domain/client/enterprise/entities/client'
import { ClientWithCreatedByUser } from '@/domain/client/enterprise/value-objects/client-with-created-by-user'

export class InMemoryClientsRepository implements ClientsRepository {
  public items: Client[] = []
  public itemsWithCreatedByUser: ClientWithCreatedByUser[] = []

  async save(client: Client): Promise<Client> {
    this.items.push(client)

    return client
  }

  async findAll(): Promise<ClientWithCreatedByUser[]> {
    return this.itemsWithCreatedByUser
  }

  async findByEmail(email: string): Promise<Client | null> {
    return this.items.find((client) => client.email === email) || null
  }

  async findById(id: string) {
    return this.items.find((client) => client.id.toString() === id) || null
  }

  async findByIdWithCreatedByUser(id: string) {
    return (
      this.itemsWithCreatedByUser.find(
        (client) => client.clientId.toString() === id,
      ) || null
    )
  }

  async update(client: Client): Promise<Client> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === client.id.toString(),
    )

    this.items[index] = client

    return client
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id)

    this.items.splice(index, 1)
  }
}
