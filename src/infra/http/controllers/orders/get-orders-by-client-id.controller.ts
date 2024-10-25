import {
  Get,
  Param,
  Controller,
  HttpException,
  ForbiddenException,
} from '@nestjs/common'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { GetOrdersByClientIdUseCase } from '@/domain/order/application/use-cases/get-orders-by-client-id-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { OrderWithVendorPresenter } from '../../presenters/order-with-vendor-presenter'

@Controller('clients/:clientId/orders')
export class GetOrdersByClientIdController {
  constructor(private getOrdersByClientIdUseCase: GetOrdersByClientIdUseCase) {}

  @Get()
  async handle(
    @Param('clientId') clientId: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const result = await this.getOrdersByClientIdUseCase.execute({
      clientId,
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

    const { orders } = result.value

    return {
      orders: orders.map(OrderWithVendorPresenter.toHTTP),
    }
  }
}
