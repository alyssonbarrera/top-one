import { Injectable } from '@nestjs/common'

import Decimal from 'decimal.js'

import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { Product } from '../../enterprise/entities/product'
import { ProductsRepository } from '../repositories/products-repository'

interface CreateProductUseCaseRequest {
  name: string
  description: string
  price: number
  discount?: number | null

  currentUser: UserPayload
}

type CreateProductUseCaseResponse = Either<
  ForbiddenError,
  {
    product: Product
  }
>

@Injectable()
export class CreateProductUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    name,
    price,
    discount,
    description,
    currentUser,
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    if (cannot('create', 'Product')) {
      return left(new ForbiddenError('create', 'product'))
    }

    const product = Product.create({
      name,
      description,
      price: new Decimal(price),
      ownerId: new UniqueEntityID(currentUser.sub),
    })

    if (typeof discount === 'number') {
      product.discount = new Decimal(discount)
    }

    await this.productsRepository.save(product)

    return right({
      product,
    })
  }
}
