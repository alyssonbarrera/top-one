import {
  Get,
  Param,
  Controller,
  HttpException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ProductNotFoundError } from '@/domain/product/application/use-cases/errors/product-not-found-error'
import { GetProductByIdUseCase } from '@/domain/product/application/use-cases/get-product-by-id-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ProductWithOwnerPresenter } from '../../presenters/product-with-owner-presenter'

@Controller('products')
export class GetProductByIdController {
  constructor(private getProductByIdUseCase: GetProductByIdUseCase) {}

  @Get(':id')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const result = await this.getProductByIdUseCase.execute({
      id,
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
      product: ProductWithOwnerPresenter.toHTTP(product),
    }
  }
}
