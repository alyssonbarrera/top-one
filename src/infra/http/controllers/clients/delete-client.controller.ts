import {
  Param,
  Delete,
  Controller,
  HttpException,
  ForbiddenException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { DeleteClientUseCase } from '@/domain/client/application/use-cases/delete-client-use-case'
import { ClientNotFoundError } from '@/domain/client/application/use-cases/errors/client-not-found-error'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

@Controller('clients')
export class DeleteClientController {
  constructor(private deleteClientUseCase: DeleteClientUseCase) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const result = await this.deleteClientUseCase.execute({
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
  }
}
