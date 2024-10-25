import { FakeMailService } from '@test/services/fake-mail-service'

import { SendNotificationUseCase } from './send-notification'

let fakeMailService: FakeMailService
let sut: SendNotificationUseCase

describe('Send Notification', () => {
  beforeEach(() => {
    fakeMailService = new FakeMailService()
    sut = new SendNotificationUseCase(fakeMailService)
  })

  it('should be able to send a notification', async () => {
    const result = await sut.execute({
      recipientEmail: 'johndoe@email.com',
      templatePath: 'path/to/template',
      title: 'Nova notificação',
      content: 'Conteúdo da notificação',
    })

    expect(result.isRight()).toBe(true)
  })
})
