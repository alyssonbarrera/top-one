import { Module } from '@nestjs/common'

import { EnvModule } from '../env/env.module'

import { MailService } from './mail.service'
import { SendGridService } from './sendgrid.service'

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: MailService,
      useClass: SendGridService,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
