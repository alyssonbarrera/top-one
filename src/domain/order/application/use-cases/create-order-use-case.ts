import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ProductsRepository } from '@/domain/product/application/repositories/products-repository'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { Order } from '../../enterprise/entities/order'
import { OrdersRepository } from '../repositories/orders-repository'

import { OrderProcessor } from './helpers/order-processor'

export type Item = {
  productId: string
  quantity: number
}

interface CreateOrderUseCaseRequest {
  clientId: string
  items: Item[]
  currentUser: UserPayload
}

type CreateOrderUseCaseResponse = Either<
  ForbiddenError,
  {
    order: Order
    notFoundProducts?: string[]
  }
>

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private orderProcessor: OrderProcessor,
    private ordersRepository: OrdersRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute({
    items,
    clientId,
    currentUser,
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    if (cannot('create', 'Order')) {
      return left(new ForbiddenError('create', 'order'))
    }

    const productsIds = items.map((item) => item.productId)
    const products = await this.productsRepository.findByIds(productsIds)

    const { order, orderItems, notFoundProducts } =
      this.orderProcessor.processOrderItems({
        items,
        products,
        clientId,
        currentUser,
      })

    await this.ordersRepository.saveWithItems(order, orderItems)

    return right({
      order,
      notFoundProducts: notFoundProducts.length ? notFoundProducts : undefined,
    })
  }
}
