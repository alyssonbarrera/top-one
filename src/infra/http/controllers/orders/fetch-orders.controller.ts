import {
  Get,
  Controller,
  HttpException,
  ForbiddenException,
  Query,
} from '@nestjs/common'

import { z } from 'zod'

import { OrderStatus } from '@/core/enums/order-status'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { FetchOrdersUseCase } from '@/domain/order/application/use-cases/fetch-orders-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { OrderWithVendorAndClientPresenter } from '../../presenters/order-with-vendor-and-client-presenter'

const orderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
})

const orderStatusValidationPipe = new ZodValidationPipe(orderStatusSchema)

type OrderStatusSchema = z.infer<typeof orderStatusSchema>

@Controller('orders')
export class FetchOrdersController {
  constructor(private fetchOrdersUseCase: FetchOrdersUseCase) {}

  @Get()
  async handle(
    @Query(orderStatusValidationPipe) query: OrderStatusSchema,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const result = await this.fetchOrdersUseCase.execute({
      status: query?.status,
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
      orders: orders.map(OrderWithVendorAndClientPresenter.toHTTP),
    }
  }
}
