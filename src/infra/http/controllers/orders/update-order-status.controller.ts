import {
  Body,
  Patch,
  Param,
  Controller,
  HttpException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'

import { z } from 'zod'

import { OrderStatus } from '@/core/enums/order-status'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { OrderNotFoundError } from '@/domain/order/application/use-cases/errors/order-not-found-error'
import { UpdateOrderStatusUseCase } from '@/domain/order/application/use-cases/update-order-status-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { OrderPresenter } from '../../presenters/order-presenter'

const updateOrderStatusBodySchema = z.object({
  status: z.nativeEnum(OrderStatus),
})

const bodyValidationPipe = new ZodValidationPipe(updateOrderStatusBodySchema)

type UpdateOrderStatusBodySchema = z.infer<typeof updateOrderStatusBodySchema>

@Controller('orders')
export class UpdateOrderStatusController {
  constructor(private updateOrderStatusUseCase: UpdateOrderStatusUseCase) {}

  @Patch(':id/status')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
    @Body(bodyValidationPipe) body: UpdateOrderStatusBodySchema,
  ) {
    const { status } = body

    const result = await this.updateOrderStatusUseCase.execute({
      id,
      status,
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
      order: OrderPresenter.toHTTP(order),
    }
  }
}
