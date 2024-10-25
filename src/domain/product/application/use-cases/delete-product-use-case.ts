import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { ProductsRepository } from '../repositories/products-repository'

import { ProductNotFoundError } from './errors/product-not-found-error'

interface DeleteProductUseCaseRequest {
  id: string
  currentUser: UserPayload
}

type DeleteProductUseCaseResponse = Either<
  ForbiddenError | ProductNotFoundError,
  null
>

@Injectable()
export class DeleteProductUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    id,
    currentUser,
  }: DeleteProductUseCaseRequest): Promise<DeleteProductUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    if (cannot('delete', 'Product')) {
      return left(new ForbiddenError('delete', 'product'))
    }

    const product = await this.productsRepository.findById(id)

    if (!product) {
      return left(new ProductNotFoundError())
    }

    await this.productsRepository.delete(product.id.toString())

    return right(null)
  }
}
