import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { orderSchema } from '@/infra/auth/abac'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { OrdersRepository } from '../repositories/orders-repository'

import { OrderNotFoundError } from './errors/order-not-found-error'

interface DeleteOrderUseCaseRequest {
  id: string
  currentUser: UserPayload
}

type DeleteOrderUseCaseResponse = Either<
  ForbiddenError | OrderNotFoundError,
  null
>

@Injectable()
export class DeleteOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    id,
    currentUser,
  }: DeleteOrderUseCaseRequest): Promise<DeleteOrderUseCaseResponse> {
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

    if (cannot('delete', vendorOrder)) {
      return left(new ForbiddenError('delete', 'order'))
    }

    await this.ordersRepository.delete(order.id.toString())

    return right(null)
  }
}
