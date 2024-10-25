import {
  Body,
  Patch,
  Param,
  HttpCode,
  Controller,
  HttpStatus,
  HttpException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common'

import { z } from 'zod'

import { ForbiddenError } from '@/core/errors/forbidden-error'

import { ChangeUserPasswordUseCase } from '@/domain/user/application/use-cases/change-user-password-use-case'
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error'
import { WrongCredentialsError } from '@/domain/user/application/use-cases/errors/wrong-credentials-error'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'

const changeUserPasswordBodySchema = z.object({
  newPassword: z.string(),
  currentPassword: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(changeUserPasswordBodySchema)

type ChangeUserPasswordBodySchema = z.infer<typeof changeUserPasswordBodySchema>

@Controller('users/:id')
export class ChangeUserPasswordController {
  constructor(private changeUserPasswordUseCase: ChangeUserPasswordUseCase) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('change-password')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
    @Body(bodyValidationPipe) body: ChangeUserPasswordBodySchema,
  ) {
    const { newPassword, currentPassword } = body

    const result = await this.changeUserPasswordUseCase.execute({
      id,
      currentUser,
      newPassword,
      currentPassword,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ForbiddenError:
          throw new ForbiddenException(error.message)
        case UserNotFoundError:
          throw new NotFoundException(error.message)
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new HttpException('Internal server error', 500)
      }
    }
  }
}
