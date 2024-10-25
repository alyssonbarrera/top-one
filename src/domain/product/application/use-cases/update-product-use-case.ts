import { Injectable } from '@nestjs/common'

import Decimal from 'decimal.js'

import { Either, left, right } from '@/core/either'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { Product } from '../../enterprise/entities/product'
import { ProductsRepository } from '../repositories/products-repository'

import { ProductNotFoundError } from './errors/product-not-found-error'

interface UpdateProductUseCaseRequest {
  id: string

  name?: string | null
  description?: string | null
  price?: number | null
  discount?: number | null

  currentUser: UserPayload
}

type UpdateProductUseCaseResponse = Either<
  ForbiddenError | ProductNotFoundError,
  {
    product: Product
  }
>

@Injectable()
export class UpdateProductUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    id,
    currentUser,
    ...data
  }: UpdateProductUseCaseRequest): Promise<UpdateProductUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    if (cannot('apply-discount', 'Product') && data.discount) {
      return left(new ForbiddenError('apply discount', 'product'))
    }

    if (cannot('update', 'Product')) {
      return left(new ForbiddenError('update', 'product'))
    }

    const product = await this.productsRepository.findById(id)

    if (!product) {
      return left(new ProductNotFoundError())
    }

    product.name = data.name ?? product.name
    product.description = data.description ?? product.description
    product.price = new Decimal(data.price ?? product.price)
    product.discount = new Decimal(data.discount ?? product.discount)
    product.updatedAt = new Date()

    await this.productsRepository.update(product)

    return right({
      product,
    })
  }
}
