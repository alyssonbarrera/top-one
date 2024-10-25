import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { ProductWithOwner } from '../../enterprise/value-objects/product-with-owner'
import { ProductsRepository } from '../repositories/products-repository'

import { ProductNotFoundError } from './errors/product-not-found-error'

interface GetProductByIdUseCaseRequest {
  id: string
  currentUser: UserPayload
}

type GetProductByIdUseCaseResponse = Either<
  ForbiddenError | ProductNotFoundError,
  {
    product: ProductWithOwner
  }
>

@Injectable()
export class GetProductByIdUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    id,
    currentUser,
  }: GetProductByIdUseCaseRequest): Promise<GetProductByIdUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    if (cannot('get', 'Product')) {
      return left(new ForbiddenError('get', 'product'))
    }

    const product = await this.productsRepository.findByIdWithOwner(id)

    if (!product) {
      return left(new ProductNotFoundError())
    }

    return right({
      product,
    })
  }
}
