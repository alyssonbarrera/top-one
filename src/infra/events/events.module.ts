import { Module } from '@nestjs/common'

import { OnOrderStatusUpdated } from '@/domain/notification/application/subscribers/on-order-status-updated'
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification'

import { DatabaseModule } from '../database/database.module'
import { MailModule } from '../mail/mail.module'

@Module({
  imports: [DatabaseModule, MailModule],
  providers: [OnOrderStatusUpdated, SendNotificationUseCase],
})
export class EventsModule {}
