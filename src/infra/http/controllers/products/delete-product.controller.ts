import {
  Param,
  Delete,
  Controller,
  HttpException,
  ForbiddenException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { DeleteProductUseCase } from '@/domain/product/application/use-cases/delete-product-use-case'
import { ProductNotFoundError } from '@/domain/product/application/use-cases/errors/product-not-found-error'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

@Controller('products')
export class DeleteProductController {
  constructor(private deleteProductUseCase: DeleteProductUseCase) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const result = await this.deleteProductUseCase.execute({
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
  }
}
