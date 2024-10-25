/* eslint-disable no-new */
import { makeClient } from '@test/factories/make-client'
import { makeOrder } from '@test/factories/make-order'
import { makeUser } from '@test/factories/make-user'
import { InMemoryClientsRepository } from '@test/repositories/in-memory-clients-repository'
import { InMemoryOrdersRepository } from '@test/repositories/in-memory-orders-repository'
import { FakeMailService } from '@test/services/fake-mail-service'
import { waitFor } from '@test/utils/wait-for'
import { MockInstance } from 'vitest'

import { OrderStatus } from '@/core/enums/order-status'
import { UserRole } from '@/core/enums/user-role'

import { Order } from '@/domain/order/enterprise/entities/order'

import {
  SendNotificationUseCase,
  SendNotificationUseCaseRequest,
  SendNotificationUseCaseResponse,
} from '../use-cases/send-notification'

import { OnOrderStatusUpdated } from './on-order-status-updated'

let fakeMailService: FakeMailService
let sendNotificationUseCase: SendNotificationUseCase
let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryClientsRepository: InMemoryClientsRepository

let sendNotificationExecuteSpy: MockInstance<
  (
    data: SendNotificationUseCaseRequest,
  ) => Promise<SendNotificationUseCaseResponse>
>

describe('On Order Status Updated', () => {
  beforeEach(() => {
    fakeMailService = new FakeMailService()
    sendNotificationUseCase = new SendNotificationUseCase(fakeMailService)
    inMemoryClientsRepository = new InMemoryClientsRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository()

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'execute')

    new OnOrderStatusUpdated(sendNotificationUseCase, inMemoryClientsRepository)
  })

  it('should send order updated status notification', async () => {
    const admin = makeUser({
      role: UserRole.ADMIN,
    })
    const vendor = makeUser()
    const client = makeClient({
      createdByUserId: admin.id,
    })
    const order = makeOrder({
      clientId: client.id,
      vendorId: vendor.id,
    })

    inMemoryClientsRepository.items.push(client)
    inMemoryOrdersRepository.items.push(order)

    Order.updateStatus(order, OrderStatus.PROCESSING)
    await inMemoryOrdersRepository.update(order)

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled()
    })
  })
})
