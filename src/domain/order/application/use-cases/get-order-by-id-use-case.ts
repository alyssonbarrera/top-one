import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { orderSchema } from '@/infra/auth/models/order'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { OrderWithVendorAndClient } from '../../enterprise/value-objects/order-with-vendor-and-client'
import { OrdersRepository } from '../repositories/orders-repository'

import { OrderNotFoundError } from './errors/order-not-found-error'

interface GetOrderByIdUseCaseRequest {
  id: string
  currentUser: UserPayload
}

type GetOrderByIdUseCaseResponse = Either<
  ForbiddenError | OrderNotFoundError,
  {
    order: OrderWithVendorAndClient
  }
>

@Injectable()
export class GetOrderByIdUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    id,
    currentUser,
  }: GetOrderByIdUseCaseRequest): Promise<GetOrderByIdUseCaseResponse> {
    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    const vendorOrder = orderSchema.parse({
      vendorId: currentUser.sub,
    })

    if (cannot('get', vendorOrder)) {
      return left(new ForbiddenError('get', 'order'))
    }

    const order = await this.ordersRepository.findByIdWithVendorAndClient(id)

    if (!order) {
      return left(new OrderNotFoundError())
    }

    return right({
      order,
    })
  }
}
