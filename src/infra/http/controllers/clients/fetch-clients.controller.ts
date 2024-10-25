import {
  Get,
  Controller,
  HttpException,
  ForbiddenException,
} from '@nestjs/common'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { FetchClientsUseCase } from '@/domain/client/application/use-cases/fetch-clients-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ClientWithCreatedByUserPresenter } from '../../presenters/client-with-created-by-user-presenter'

@Controller('clients')
export class FetchClientsController {
  constructor(private fetchClientsUseCase: FetchClientsUseCase) {}

  @Get()
  async handle(@CurrentUser() currentUser: UserPayload) {
    const result = await this.fetchClientsUseCase.execute({
      currentUser,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ForbiddenError:
          throw new ForbiddenException(error.message)
        default:
          throw new HttpException('Internal server error', 500)
      }
    }

    const { clients } = result.value

    return {
      clients: clients.map(ClientWithCreatedByUserPresenter.toHTTP),
    }
  }
}
