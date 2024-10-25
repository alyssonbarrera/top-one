import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { OrderStatus } from '@/core/enums/order-status'
import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ProductsRepository } from '@/domain/product/application/repositories/products-repository'
import { orderSchema } from '@/infra/auth/models/order'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { Order } from '../../enterprise/entities/order'
import { OrderItem } from '../../enterprise/entities/order-item'
import { OrderItemsRepository } from '../repositories/order-items-repository'
import { OrdersRepository } from '../repositories/orders-repository'

import { Item } from './create-order-use-case'
import { OrderNotFoundError } from './errors/order-not-found-error'
import { OrderProcessor } from './helpers/order-processor'

type UpdateOrderWithItemsProps = {
  order: Order
  items: Item[]
  orderItems: OrderItem[]
  currentUser: UserPayload
}

interface UpdateOrderUseCaseRequest {
  id: string
  items?: Item[]
  status?: OrderStatus
  clientId?: string
  currentUser: UserPayload
}

type UpdateOrderUseCaseResponse = Either<
  ForbiddenError | OrderNotFoundError,
  {
    order: Order
    message?: string
    notFoundProducts?: string[]
  }
>

@Injectable()
export class UpdateOrderUseCase {
  constructor(
    private orderProcessor: OrderProcessor,
    private ordersRepository: OrdersRepository,
    private orderItemsRepository: OrderItemsRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute({
    id,
    items,
    status,
    clientId,
    currentUser,
  }: UpdateOrderUseCaseRequest): Promise<UpdateOrderUseCaseResponse> {
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

    if (cannot('update', vendorOrder)) {
      return left(new ForbiddenError('update', 'order'))
    }

    order.status = status ?? order.status
    order.clientId = clientId ? new UniqueEntityID(clientId) : order.clientId
    order.updatedAt = new Date()

    if (items) {
      const orderItems = await this.orderItemsRepository.findByOrderId(
        order.id.toString(),
      )

      const { order: updatedOrder, notFoundProducts } =
        await this.updateOrderWithItems({
          items,
          order,
          orderItems,
          currentUser,
        })

      if (!updatedOrder) {
        return right({
          order,
          notFoundProducts,
          message: 'Order has been deleted because it has no items',
        })
      }

      return right({
        order: updatedOrder,
        notFoundProducts,
      })
    }

    await this.ordersRepository.update(order)

    return right({
      order,
    })
  }

  private async updateOrderWithItems({
    items,
    order,
    orderItems,
    currentUser,
  }: UpdateOrderWithItemsProps) {
    const productsIds = items.map((item) => item.productId)
    const products = await this.productsRepository.findByIds(productsIds)

    const {
      orderItemsToDelete,
      order: processedOrder,
      orderItems: processedOrderItems,
      notFoundProducts: processedNotFoundProducts,
    } = this.orderProcessor.processOrderItems({
      order,
      items,
      products,
      orderItems,
      currentUser,
      clientId: order.clientId.toString(),
    })

    const processedOrderItemsWithoutNotFoundProducts =
      processedOrderItems.filter(
        (orderItem) =>
          !processedNotFoundProducts.includes(orderItem.productId.toString()),
      )

    await this.ordersRepository.updateWithItems({
      order: processedOrder,
      items: processedOrderItemsWithoutNotFoundProducts,
      itemsToDelete: orderItemsToDelete,
    })

    if (processedOrder.totalPrice.toNumber() === 0) {
      await this.ordersRepository.delete(processedOrder.id.toString())

      return {
        order: null,
        notFoundProducts: processedNotFoundProducts,
      }
    }

    return {
      order: processedOrder,
      notFoundProducts: processedNotFoundProducts.length
        ? processedNotFoundProducts
        : undefined,
    }
  }
}
