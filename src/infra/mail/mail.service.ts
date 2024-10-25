export type SendMailParams = {
  to: string
  subject: string
  variables: {
    [key: string]: string
  }
  templatePath: string
}

export abstract class MailService {
  abstract send(data: SendMailParams): Promise<any>
}
