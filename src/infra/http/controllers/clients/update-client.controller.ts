import {
  Put,
  Body,
  Param,
  Controller,
  HttpException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'

import { z } from 'zod'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ClientAlreadyExistsError } from '@/domain/client/application/use-cases/errors/client-already-exists-error'
import { ClientNotFoundError } from '@/domain/client/application/use-cases/errors/client-not-found-error'
import { UpdateClientUseCase } from '@/domain/client/application/use-cases/update-client-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { ClientPresenter } from '../../presenters/client-presenter'

const updateClientBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

const bodyValidationPipe = new ZodValidationPipe(updateClientBodySchema)

type UpdateClientBodySchema = z.infer<typeof updateClientBodySchema>

@Controller('clients')
export class UpdateClientController {
  constructor(private updateClientUseCase: UpdateClientUseCase) {}

  @Put(':id')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
    @Body(bodyValidationPipe) body: UpdateClientBodySchema,
  ) {
    const { name, email, phone, address } = body

    const result = await this.updateClientUseCase.execute({
      id,
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
        case ClientNotFoundError:
          throw new NotFoundException(error.message)
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
