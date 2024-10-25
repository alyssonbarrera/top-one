import {
  Patch,
  Param,
  HttpCode,
  Controller,
  HttpStatus,
  HttpException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { CartNotFoundError } from '@/domain/cart/application/use-cases/errors/cart-not-found-error'
import { FinishCartAndCreateOrderUseCase } from '@/domain/cart/application/use-cases/finish-cart-and-create-order-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { OrderPresenter } from '../../presenters/order-presenter'

@Controller('carts')
export class FinishCartAndCreateOrderController {
  constructor(
    private finishCartAndCreateOrderUseCase: FinishCartAndCreateOrderUseCase,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Patch(':id/finish')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const result = await this.finishCartAndCreateOrderUseCase.execute({
      id,
      currentUser,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case CartNotFoundError:
          throw new NotFoundException(error.message)
        case ForbiddenError:
          throw new ForbiddenException(error.message)
        default:
          throw new HttpException('Internal server error', 500)
      }
    }

    const { order } = result.value

    return {
      order: OrderPresenter.toHTTP(order),
    }
  }
}
