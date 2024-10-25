import { Injectable } from '@nestjs/common'

import { Either, right } from '@/core/either'

import { MailService } from '@/infra/mail/mail.service'

import { Notification } from '../../enterprise/entities/notification'

export interface SendNotificationUseCaseRequest {
  title: string
  content: string
  templatePath: string
  recipientEmail: string
}

export type SendNotificationUseCaseResponse = Either<
  null,
  {
    notification: Notification
  }
>

@Injectable()
export class SendNotificationUseCase {
  constructor(private mailService: MailService) {}

  async execute({
    title,
    content,
    templatePath,
    recipientEmail,
  }: SendNotificationUseCaseRequest): Promise<SendNotificationUseCaseResponse> {
    const notification = Notification.create({
      title,
      content,
      recipientEmail,
    })

    this.mailService.send({
      templatePath,
      subject: 'Order status updated',
      to: notification.recipientEmail,
      variables: {
        title: notification.title,
        content: notification.content,
      },
    })

    return right({
      notification,
    })
  }
}
