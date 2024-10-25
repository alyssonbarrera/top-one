import { Injectable } from '@nestjs/common'

import Decimal from 'decimal.js'

import { Either, left, right } from '@/core/either'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { Product } from '../../enterprise/entities/product'
import { ProductsRepository } from '../repositories/products-repository'

import { ProductNotFoundError } from './errors/product-not-found-error'

interface ApplyDiscountUseCaseRequest {
  id: string
  discount: number
  currentUser: UserPayload
}

type ApplyDiscountUseCaseResponse = Either<
  ForbiddenError | ProductNotFoundError,
  {
    product: Product
  }
>

@Injectable()
export class ApplyDiscountUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    id,
    discount,
    currentUser,
  }: ApplyDiscountUseCaseRequest): Promise<ApplyDiscountUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    if (cannot('apply-discount', 'Product')) {
      return left(new ForbiddenError('apply discount', 'product'))
    }

    const product = await this.productsRepository.findById(id)

    if (!product) {
      return left(new ProductNotFoundError())
    }

    product.discount = new Decimal(discount)
    product.updatedAt = new Date()

    await this.productsRepository.update(product)

    return right({
      product,
    })
  }
}
