import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { OrderWithVendor } from '../../enterprise/value-objects/order-with-vendor'
import { OrdersRepository } from '../repositories/orders-repository'

import { OrderNotFoundError } from './errors/order-not-found-error'

interface GetOrdersByClientIdUseCaseRequest {
  clientId: string
  currentUser: UserPayload
}

type GetOrdersByClientIdUseCaseResponse = Either<
  ForbiddenError | OrderNotFoundError,
  {
    orders: OrderWithVendor[]
  }
>

@Injectable()
export class GetOrdersByClientIdUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    clientId,
    currentUser,
  }: GetOrdersByClientIdUseCaseRequest): Promise<GetOrdersByClientIdUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    if (cannot('get', 'Order')) {
      return left(new ForbiddenError('get', 'order'))
    }

    const orders =
      await this.ordersRepository.findByClientIdWithVendor(clientId)

    return right({
      orders,
    })
  }
}
