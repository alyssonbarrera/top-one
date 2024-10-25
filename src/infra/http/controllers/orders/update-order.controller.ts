import {
  Put,
  Body,
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
import { UpdateOrderUseCase } from '@/domain/order/application/use-cases/update-order-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { OrderPresenter } from '../../presenters/order-presenter'

const updateOrderBodySchema = z.object({
  clientId: z.string().uuid().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number(),
      }),
    )
    .optional(),
  status: z.nativeEnum(OrderStatus).optional(),
})

const bodyValidationPipe = new ZodValidationPipe(updateOrderBodySchema)

type UpdateOrderBodySchema = z.infer<typeof updateOrderBodySchema>

@Controller('orders')
export class UpdateOrderController {
  constructor(private updateOrderUseCase: UpdateOrderUseCase) {}

  @Put(':id')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
    @Body(bodyValidationPipe) body: UpdateOrderBodySchema,
  ) {
    const { items, clientId, status } = body

    const result = await this.updateOrderUseCase.execute({
      id,
      items,
      status,
      clientId,
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

    const { order, message, notFoundProducts } = result.value

    if (message) return { message }

    return {
      order: OrderPresenter.toHTTP(order),
      notFoundProducts,
    }
  }
}
