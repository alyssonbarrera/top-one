import { Module } from '@nestjs/common'

import { AddProductsToCartUseCase } from '@/domain/cart/application/use-cases/add-products-to-cart-use-case'
import { FinishCartAndCreateOrderUseCase } from '@/domain/cart/application/use-cases/finish-cart-and-create-order-use-case'
import { CartProcessor } from '@/domain/cart/application/use-cases/helpers/cart-processor'
import { CreateClientUseCase } from '@/domain/client/application/use-cases/create-client-use-case'
import { DeleteClientUseCase } from '@/domain/client/application/use-cases/delete-client-use-case'
import { FetchClientsUseCase } from '@/domain/client/application/use-cases/fetch-clients-use-case'
import { GetClientByIdUseCase } from '@/domain/client/application/use-cases/get-client-by-id-use-case'
import { UpdateClientUseCase } from '@/domain/client/application/use-cases/update-client-use-case'
import { CreateOrderUseCase } from '@/domain/order/application/use-cases/create-order-use-case'
import { DeleteOrderUseCase } from '@/domain/order/application/use-cases/delete-order-use-case'
import { FetchOrdersUseCase } from '@/domain/order/application/use-cases/fetch-orders-use-case'
import { GetOrderByIdUseCase } from '@/domain/order/application/use-cases/get-order-by-id-use-case'
import { GetOrdersByClientIdUseCase } from '@/domain/order/application/use-cases/get-orders-by-client-id-use-case'
import { OrderProcessor } from '@/domain/order/application/use-cases/helpers/order-processor'
import { UpdateOrderStatusUseCase } from '@/domain/order/application/use-cases/update-order-status-use-case'
import { UpdateOrderUseCase } from '@/domain/order/application/use-cases/update-order-use-case'
import { ApplyDiscountUseCase } from '@/domain/product/application/use-cases/apply-discount-use-case'
import { CreateProductUseCase } from '@/domain/product/application/use-cases/create-product-use-case'
import { DeleteProductUseCase } from '@/domain/product/application/use-cases/delete-product-use-case'
import { FetchProductsUseCase } from '@/domain/product/application/use-cases/fetch-products-use-case'
import { GetProductByIdUseCase } from '@/domain/product/application/use-cases/get-product-by-id-use-case'
import { UpdateProductUseCase } from '@/domain/product/application/use-cases/update-product-use-case'
import { AuthenticateUserUseCase } from '@/domain/user/application/use-cases/authenticate-user-use-case'
import { ChangeUserPasswordUseCase } from '@/domain/user/application/use-cases/change-user-password-use-case'

import { AddProductsToCartController } from './controllers/carts/add-products-to-cart.controller'
import { FinishCartAndCreateOrderController } from './controllers/carts/finish-cart-and-create-order.controller'
import { CreateClientController } from './controllers/clients/create-client.controller'
import { DeleteClientController } from './controllers/clients/delete-client.controller'
import { FetchClientsController } from './controllers/clients/fetch-clients.controller'
import { GetClientByIdController } from './controllers/clients/get-client-by-id.controller'
import { UpdateClientController } from './controllers/clients/update-client.controller'
import { CreateOrderController } from './controllers/orders/create-order.controller'
import { DeleteOrderController } from './controllers/orders/delete-order.controller'
import { FetchOrdersController } from './controllers/orders/fetch-orders.controller'
import { GetOrderByIdController } from './controllers/orders/get-order-by-id.controller'
import { GetOrdersByClientIdController } from './controllers/orders/get-orders-by-client-id.controller'
import { UpdateOrderStatusController } from './controllers/orders/update-order-status.controller'
import { UpdateOrderController } from './controllers/orders/update-order.controller'
import { ApplyDiscountController } from './controllers/products/apply-discount.controller'
import { CreateProductController } from './controllers/products/create-product.controller'
import { DeleteProductController } from './controllers/products/delete-product.controller'
import { FetchProductsController } from './controllers/products/fetch-products.controller'
import { GetProductByIdController } from './controllers/products/get-product-by-id.controller'
import { UpdateProductController } from './controllers/products/update-product.controller'
import { AuthenticateUserController } from './controllers/users/authenticate-user.controller'
import { ChangeUserPasswordController } from './controllers/users/change-user-password.controller'

import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    AuthenticateUserController,
    ChangeUserPasswordController,

    CreateProductController,
    GetProductByIdController,
    UpdateProductController,
    DeleteProductController,
    FetchProductsController,
    ApplyDiscountController,

    CreateClientController,
    FetchClientsController,
    GetClientByIdController,
    UpdateClientController,
    DeleteClientController,

    CreateOrderController,
    GetOrdersByClientIdController,
    FetchOrdersController,
    GetOrderByIdController,
    UpdateOrderController,
    UpdateOrderStatusController,
    DeleteOrderController,

    AddProductsToCartController,
    FinishCartAndCreateOrderController,
  ],
  providers: [
    AuthenticateUserUseCase,
    ChangeUserPasswordUseCase,

    CreateProductUseCase,
    GetProductByIdUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    FetchProductsUseCase,
    ApplyDiscountUseCase,

    CreateClientUseCase,
    FetchClientsUseCase,
    GetClientByIdUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,

    CreateOrderUseCase,
    GetOrdersByClientIdUseCase,
    FetchOrdersUseCase,
    GetOrderByIdUseCase,
    UpdateOrderUseCase,
    UpdateOrderStatusUseCase,
    DeleteOrderUseCase,

    OrderProcessor,
    CartProcessor,

    AddProductsToCartUseCase,
    FinishCartAndCreateOrderUseCase,
  ],
})
export class HttpModule {}
