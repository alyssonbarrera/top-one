import {
  Get,
  Param,
  Controller,
  HttpException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ClientNotFoundError } from '@/domain/client/application/use-cases/errors/client-not-found-error'
import { GetClientByIdUseCase } from '@/domain/client/application/use-cases/get-client-by-id-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ClientWithCreatedByUserPresenter } from '../../presenters/client-with-created-by-user-presenter'

@Controller('clients')
export class GetClientByIdController {
  constructor(private getClientByIdUseCase: GetClientByIdUseCase) {}

  @Get(':id')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const result = await this.getClientByIdUseCase.execute({
      id,
      currentUser,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ForbiddenError:
          throw new ForbiddenException(error.message)
        case ClientNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new HttpException('Internal server error', 500)
      }
    }

    const { client } = result.value

    return {
      client: ClientWithCreatedByUserPresenter.toHTTP(client),
    }
  }
}
