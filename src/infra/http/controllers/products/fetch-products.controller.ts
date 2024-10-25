import {
  Get,
  Controller,
  HttpException,
  ForbiddenException,
} from '@nestjs/common'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { FetchProductsUseCase } from '@/domain/product/application/use-cases/fetch-products-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ProductWithOwnerPresenter } from '../../presenters/product-with-owner-presenter'

@Controller('products')
export class FetchProductsController {
  constructor(private fetchProductsUseCase: FetchProductsUseCase) {}

  @Get()
  async handle(@CurrentUser() currentUser: UserPayload) {
    const result = await this.fetchProductsUseCase.execute({
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

    const { products } = result.value

    return {
      products: products.map(ProductWithOwnerPresenter.toHTTP),
    }
  }
}
