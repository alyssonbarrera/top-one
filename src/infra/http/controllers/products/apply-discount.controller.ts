import {
  Body,
  Param,
  Patch,
  Controller,
  HttpException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'

import { z } from 'zod'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ApplyDiscountUseCase } from '@/domain/product/application/use-cases/apply-discount-use-case'
import { ProductNotFoundError } from '@/domain/product/application/use-cases/errors/product-not-found-error'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { ProductPresenter } from '../../presenters/product-presenter'

const applyDiscountBodySchema = z.object({
  discount: z.coerce.number().max(100),
})

const bodyValidationPipe = new ZodValidationPipe(applyDiscountBodySchema)

type ApplyDiscountBodySchema = z.infer<typeof applyDiscountBodySchema>

@Controller('products')
export class ApplyDiscountController {
  constructor(private applyDiscountUseCase: ApplyDiscountUseCase) {}

  @Patch(':id')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
    @Body(bodyValidationPipe) body: ApplyDiscountBodySchema,
  ) {
    const { discount } = body

    const result = await this.applyDiscountUseCase.execute({
      id,
      discount,
      currentUser,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ForbiddenError:
          throw new ForbiddenException(error.message)
        case ProductNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new HttpException('Internal server error', 500)
      }
    }

    const { product } = result.value

    return {
      product: ProductPresenter.toHTTP(product),
    }
  }
}
