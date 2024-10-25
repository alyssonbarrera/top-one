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

import { CreateProductUseCase } from '@/domain/product/application/use-cases/create-product-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { ProductPresenter } from '../../presenters/product-presenter'

const createProductBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.coerce.number(),
  discount: z.coerce.number().nullish(),
})

const bodyValidationPipe = new ZodValidationPipe(createProductBodySchema)

type CreateProductBodySchema = z.infer<typeof createProductBodySchema>

@Controller('products')
export class CreateProductController {
  constructor(private createProductUseCase: CreateProductUseCase) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @CurrentUser() currentUser: UserPayload,
    @Body(bodyValidationPipe) body: CreateProductBodySchema,
  ) {
    const { name, description, discount, price } = body

    const result = await this.createProductUseCase.execute({
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
