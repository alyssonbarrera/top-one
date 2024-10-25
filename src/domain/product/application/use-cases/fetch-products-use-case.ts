import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { ProductWithOwner } from '../../enterprise/value-objects/product-with-owner'
import { ProductsRepository } from '../repositories/products-repository'

interface FetchProductsUseCaseRequest {
  currentUser: UserPayload
}

type FetchProductsUseCaseResponse = Either<
  ForbiddenError,
  {
    products: ProductWithOwner[]
  }
>

@Injectable()
export class FetchProductsUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    currentUser,
  }: FetchProductsUseCaseRequest): Promise<FetchProductsUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    if (cannot('get', 'Product')) {
      return left(new ForbiddenError('get', 'product'))
    }

    const products = await this.productsRepository.findAll()

    return right({
      products,
    })
  }
}
