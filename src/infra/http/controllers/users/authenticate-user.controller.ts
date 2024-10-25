import {
  Body,
  Post,
  Controller,
  HttpException,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'

import { z } from 'zod'

import { AuthenticateUserUseCase } from '@/domain/user/application/use-cases/authenticate-user-use-case'
import { WrongCredentialsError } from '@/domain/user/application/use-cases/errors/wrong-credentials-error'
import { Public } from '@/infra/auth/decorators/public'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { UserPresenter } from '../../presenters/user-presenter'

const authenticateUserBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(authenticateUserBodySchema)

type AuthenticateUserBodySchema = z.infer<typeof authenticateUserBodySchema>

@Public()
@Controller('auth')
export class AuthenticateUserController {
  constructor(private authenticateUserUseCase: AuthenticateUserUseCase) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('sessions')
  async handle(@Body(bodyValidationPipe) body: AuthenticateUserBodySchema) {
    const { email, password } = body

    const result = await this.authenticateUserUseCase.execute({
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new HttpException('Internal server error', 500)
      }
    }

    const { user, accessToken } = result.value

    return {
      user: UserPresenter.toHTTP(user),
      accessToken,
    }
  }
}
