import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { OrderStatus } from '@/core/enums/order-status'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { orderSchema } from '@/infra/auth/abac'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { OrderWithVendorAndClient } from '../../enterprise/value-objects/order-with-vendor-and-client'
import { OrdersRepository } from '../repositories/orders-repository'

import { OrderNotFoundError } from './errors/order-not-found-error'

interface FetchOrdersUseCaseRequest {
  status?: OrderStatus
  currentUser: UserPayload
}

type FetchOrdersUseCaseResponse = Either<
  ForbiddenError | OrderNotFoundError,
  {
    orders: OrderWithVendorAndClient[]
  }
>

@Injectable()
export class FetchOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    status,
    currentUser,
  }: FetchOrdersUseCaseRequest): Promise<FetchOrdersUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    const order = orderSchema.parse({
      vendorId: currentUser.sub,
    })

    if (cannot('get', order)) {
      return left(new ForbiddenError('get', 'order'))
    }

    const orders = await this.ordersRepository.findAll({
      filters: {
        status,
      },
    })

    return right({
      orders,
    })
  }
}
