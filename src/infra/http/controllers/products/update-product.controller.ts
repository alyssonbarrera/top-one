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

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ProductNotFoundError } from '@/domain/product/application/use-cases/errors/product-not-found-error'
import { UpdateProductUseCase } from '@/domain/product/application/use-cases/update-product-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { ProductPresenter } from '../../presenters/product-presenter'

const updateProductBodySchema = z.object({
  name: z.string().nullish(),
  description: z.string().nullish(),
  price: z.coerce.number().min(0).nullish(),
  discount: z.coerce.number().max(100).nullish(),
})

const bodyValidationPipe = new ZodValidationPipe(updateProductBodySchema)

type UpdateProductBodySchema = z.infer<typeof updateProductBodySchema>

@Controller('products')
export class UpdateProductController {
  constructor(private updateProductUseCase: UpdateProductUseCase) {}

  @Put(':id')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
    @Body(bodyValidationPipe) body: UpdateProductBodySchema,
  ) {
    const { name, description, discount, price } = body

    const result = await this.updateProductUseCase.execute({
      id,
      name,
      price,
      discount,
      description,
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
