import * as fs from 'fs'

import { Injectable } from '@nestjs/common'

import * as SendGrid from '@sendgrid/mail'
import handlebars from 'handlebars'

import { EnvService } from '../env/env.service'

import { MailService, SendMailParams } from './mail.service'

@Injectable()
export class SendGridService implements MailService {
  constructor(private readonly config: EnvService) {
    SendGrid.setApiKey(this.config.get('SENDGRID_API_KEY'))
  }

  async send({
    to,
    subject,
    variables,
    templatePath,
  }: SendMailParams): Promise<any> {
    const templateFileContent = fs.readFileSync(templatePath).toString('utf-8')
    const templateParse = handlebars.compile(templateFileContent)
    const templateHTML = templateParse(variables)

    const transport = await SendGrid.send({
      to,
      subject,
      html: templateHTML,
      from: 'top-one@alyssonbarrera.com',
    })

    return transport
  }
}
