import { MailService, SendMailParams } from '@/infra/mail/mail.service'

export class FakeMailService implements MailService {
  public items: SendMailParams[] = []

  async send(data: SendMailParams): Promise<void> {
    this.items.push(data)
  }
}
