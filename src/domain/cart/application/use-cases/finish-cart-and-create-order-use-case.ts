import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'

import { Order } from '@/domain/order/enterprise/entities/order'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { CreateOrderUseCase } from '../../../order/application/use-cases/create-order-use-case'
import { CartsRepository } from '../repositories/carts-repository'

import { CartNotFoundError } from './errors/cart-not-found-error'

interface FinishCartAndCreateOrderUseCaseRequest {
  id: string
  currentUser: UserPayload
}

type FinishCartAndCreateOrderUseCaseResponse = Either<
  CartNotFoundError,
  {
    order: Order
  }
>

@Injectable()
export class FinishCartAndCreateOrderUseCase {
  constructor(
    private cartsRepository: CartsRepository,
    private createOrderUseCase: CreateOrderUseCase,
  ) {}

  async execute({
    id,
    currentUser,
  }: FinishCartAndCreateOrderUseCaseRequest): Promise<FinishCartAndCreateOrderUseCaseResponse> {
    const cart = await this.cartsRepository.findByIdWithProducts(id)

    if (!cart) {
      return left(new CartNotFoundError())
    }

    const result = await this.createOrderUseCase.execute({
      clientId: cart.clientId.toString(),
      currentUser,
      items: cart.products.map((product) => ({
        productId: product.productId.toString(),
        quantity: product.quantity,
      })),
    })

    if (result.isLeft()) {
      return left(result.value)
    }

    await this.cartsRepository.delete(id)

    return right({
      order: result.value.order,
    })
  }
}
