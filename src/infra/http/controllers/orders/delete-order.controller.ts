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

import { DeleteOrderUseCase } from '@/domain/order/application/use-cases/delete-order-use-case'
import { OrderNotFoundError } from '@/domain/order/application/use-cases/errors/order-not-found-error'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

@Controller('orders')
export class DeleteOrderController {
  constructor(private deleteOrderUseCase: DeleteOrderUseCase) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const result = await this.deleteOrderUseCase.execute({
      id,
      currentUser,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ForbiddenError:
          throw new ForbiddenException(error.message)
        case OrderNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new HttpException('Internal server error', 500)
      }
    }
  }
}
