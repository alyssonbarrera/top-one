import {
  Body,
  Post,
  HttpCode,
  Controller,
  HttpStatus,
  HttpException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common'

import { z } from 'zod'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { CreateClientUseCase } from '@/domain/client/application/use-cases/create-client-use-case'
import { ClientAlreadyExistsError } from '@/domain/client/application/use-cases/errors/client-already-exists-error'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { ClientPresenter } from '../../presenters/client-presenter'

const createClientBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(createClientBodySchema)

type CreateClientBodySchema = z.infer<typeof createClientBodySchema>

@Controller('clients')
export class CreateClientController {
  constructor(private createClientUseCase: CreateClientUseCase) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @CurrentUser() currentUser: UserPayload,
    @Body(bodyValidationPipe) body: CreateClientBodySchema,
  ) {
    const { name, email, phone, address } = body

    const result = await this.createClientUseCase.execute({
      name,
      email,
      phone,
      address,
      currentUser,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ForbiddenError:
          throw new ForbiddenException(error.message)
        case ClientAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new HttpException('Internal server error', 500)
      }
    }

    const { client } = result.value

    return {
      client: ClientPresenter.toHTTP(client),
    }
  }
}
