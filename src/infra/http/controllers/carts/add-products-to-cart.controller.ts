import {
  Body,
  Post,
  Param,
  HttpCode,
  Controller,
  HttpStatus,
  HttpException,
  NotFoundException,
} from '@nestjs/common'

import { z } from 'zod'

import { AddProductsToCartUseCase } from '@/domain/cart/application/use-cases/add-products-to-cart-use-case'
import { ClientNotFoundError } from '@/domain/client/application/use-cases/errors/client-not-found-error'
import { Public } from '@/infra/auth/decorators/public'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { CartWithTotalPricePresenter } from '../../presenters/cart-with-total-price-presenter'

const addProductsToCartBodySchema = z.object({
  products: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number(),
    }),
  ),
})

const bodyValidationPipe = new ZodValidationPipe(addProductsToCartBodySchema)

type AddProductsToCartBodySchema = z.infer<typeof addProductsToCartBodySchema>

@Public()
@Controller('clients')
export class AddProductsToCartController {
  constructor(private addProductsToCartUseCase: AddProductsToCartUseCase) {}

  @HttpCode(HttpStatus.CREATED)
  @Post(':clientId/cart')
  async handle(
    @Param('clientId') clientId: string,
    @Body(bodyValidationPipe) body: AddProductsToCartBodySchema,
  ) {
    const { products } = body

    const result = await this.addProductsToCartUseCase.execute({
      clientId,
      products,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ClientNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new HttpException('Internal server error', 500)
      }
    }

    const { cart } = result.value

    return {
      cart: CartWithTotalPricePresenter.toHTTP(cart),
    }
  }
}
