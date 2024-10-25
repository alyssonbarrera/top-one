import * as path from 'path'

import { Injectable } from '@nestjs/common'

import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'

import { ClientsRepository } from '@/domain/client/application/repositories/clients-repository'
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification'
import { OrderCreatedEvent } from '@/domain/order/enterprise/events/order-status-updated-event'

@Injectable()
export class OnOrderStatusUpdated implements EventHandler {
  constructor(
    private sendNotification: SendNotificationUseCase,
    private clientsRepository: ClientsRepository,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendOrderUpdatedStatusNotification.bind(this),
      OrderCreatedEvent.name,
    )
  }

  private async sendOrderUpdatedStatusNotification({
    order,
  }: OrderCreatedEvent) {
    const client = await this.clientsRepository.findById(
      order.clientId.toString(),
    )

    if (client) {
      const templatePath = path.resolve(
        process.cwd(),
        'src',
        'infra',
        'mail',
        'templates',
        'order-updated-status.hbs',
      )

      await this.sendNotification.execute({
        templatePath,
        recipientEmail: client.email,
        title: `Order "${order.id.toString()}"`,
        content: `The order status has been updated to "${order.status}"`,
      })
    }
  }
}
