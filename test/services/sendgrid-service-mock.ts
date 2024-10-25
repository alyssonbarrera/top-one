import { Injectable } from '@nestjs/common'

import { MailService, SendMailParams } from '@/infra/mail/mail.service'

@Injectable()
export class SendGridServiceMock implements MailService {
  async send(params: SendMailParams): Promise<any> {
    console.log('SendGridServiceMock.send', params)
    return Promise.resolve()
  }
}
