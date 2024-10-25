import {
  Get,
  Param,
  Controller,
  HttpException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { OrderNotFoundError } from '@/domain/order/application/use-cases/errors/order-not-found-error'
import { GetOrderByIdUseCase } from '@/domain/order/application/use-cases/get-order-by-id-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { OrderWithVendorAndClientPresenter } from '../../presenters/order-with-vendor-and-client-presenter'

@Controller('orders')
export class GetOrderByIdController {
  constructor(private getOrderByIdUseCase: GetOrderByIdUseCase) {}

  @Get(':id')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const result = await this.getOrderByIdUseCase.execute({
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

    const { order } = result.value

    return {
      order: OrderWithVendorAndClientPresenter.toHTTP(order),
    }
  }
}
