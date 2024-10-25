import { Client } from '../../enterprise/entities/client'
import { ClientWithCreatedByUser } from '../../enterprise/value-objects/client-with-created-by-user'

export abstract class ClientsRepository {
  abstract save(data: Client): Promise<Client>
  abstract findAll(): Promise<ClientWithCreatedByUser[]>
  abstract findByEmail(email: string): Promise<Client | null>
  abstract findById(id: string): Promise<Client | null>
  abstract findByIdWithCreatedByUser(
    id: string,
  ): Promise<ClientWithCreatedByUser | null>

  abstract update(data: Client): Promise<Client>
  abstract delete(id: string): Promise<void>
}
