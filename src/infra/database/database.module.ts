import { Module } from '@nestjs/common'

import { CartItemsRepository } from '@/domain/cart/application/repositories/cart-items-repository'
import { CartsRepository } from '@/domain/cart/application/repositories/carts-repository'
import { ClientsRepository } from '@/domain/client/application/repositories/clients-repository'
import { OrderItemsRepository } from '@/domain/order/application/repositories/order-items-repository'
import { OrdersRepository } from '@/domain/order/application/repositories/orders-repository'
import { ProductsRepository } from '@/domain/product/application/repositories/products-repository'
import { UsersRepository } from '@/domain/user/application/repositories/users-repository'

import { PrismaService } from './prisma/prisma.service'
import { PrismaCartItemsRepository } from './prisma/repositories/prisma-cart-items-repository'
import { PrismaCartsRepository } from './prisma/repositories/prisma-carts-repository'
import { PrismaClientsRepository } from './prisma/repositories/prisma-clients-repository'
import { PrismaOrderItemsRepository } from './prisma/repositories/prisma-order-items-repository'
import { PrismaOrdersRepository } from './prisma/repositories/prisma-orders-repository'
import { PrismaProductsRepository } from './prisma/repositories/prisma-products-repository'
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository'

@Module({
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: ProductsRepository,
      useClass: PrismaProductsRepository,
    },
    {
      provide: ClientsRepository,
      useClass: PrismaClientsRepository,
    },
    {
      provide: OrdersRepository,
      useClass: PrismaOrdersRepository,
    },
    {
      provide: OrderItemsRepository,
      useClass: PrismaOrderItemsRepository,
    },
    {
      provide: CartsRepository,
      useClass: PrismaCartsRepository,
    },
    {
      provide: CartItemsRepository,
      useClass: PrismaCartItemsRepository,
    },
  ],
  exports: [
    PrismaService,
    UsersRepository,
    ProductsRepository,
    ClientsRepository,
    OrdersRepository,
    OrderItemsRepository,
    CartsRepository,
    CartItemsRepository,
  ],
})
export class DatabaseModule {}
