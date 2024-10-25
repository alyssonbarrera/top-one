import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { OrderStatus } from '@/core/enums/order-status'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { orderSchema } from '@/infra/auth/models/order'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { Order } from '../../enterprise/entities/order'
import { OrdersRepository } from '../repositories/orders-repository'

import { OrderNotFoundError } from './errors/order-not-found-error'

interface UpdateOrderStatusUseCaseRequest {
  id: string
  status: OrderStatus
  currentUser: UserPayload
}

type UpdateOrderStatusUseCaseResponse = Either<
  ForbiddenError | OrderNotFoundError,
  {
    order: Order
    notFoundProducts?: string[]
  }
>

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    id,
    status,
    currentUser,
  }: UpdateOrderStatusUseCaseRequest): Promise<UpdateOrderStatusUseCaseResponse> {
    const order = await this.ordersRepository.findById(id)

    if (!order) {
      return left(new OrderNotFoundError())
    }

    const { cannot } = getUserPermissions(currentUser.sub, currentUser.role)

    const vendorOrder = orderSchema.parse({
      id,
      vendorId: currentUser.sub,
      status: order.status,
    })

    if (cannot('update-status', vendorOrder)) {
      return left(new ForbiddenError('update-status', 'order'))
    }

    Order.updateStatus(order, status)
    order.updatedAt = new Date()

    await this.ordersRepository.update(order)

    return right({
      order,
    })
  }
}
