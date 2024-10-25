import {
  Body,
  Post,
  HttpCode,
  Controller,
  HttpStatus,
  HttpException,
  ForbiddenException,
} from '@nestjs/common'

import { z } from 'zod'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { CreateOrderUseCase } from '@/domain/order/application/use-cases/create-order-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { OrderPresenter } from '../../presenters/order-presenter'

const createOrderBodySchema = z.object({
  clientId: z.string().uuid(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number(),
    }),
  ),
})

const bodyValidationPipe = new ZodValidationPipe(createOrderBodySchema)

type CreateOrderBodySchema = z.infer<typeof createOrderBodySchema>

@Controller('orders')
export class CreateOrderController {
  constructor(private createOrderUseCase: CreateOrderUseCase) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @CurrentUser() currentUser: UserPayload,
    @Body(bodyValidationPipe) body: CreateOrderBodySchema,
  ) {
    const { items, clientId } = body

    const result = await this.createOrderUseCase.execute({
      items,
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

    const { order, notFoundProducts } = result.value

    return {
      order: OrderPresenter.toHTTP(order),
      notFoundProducts,
    }
  }
}
