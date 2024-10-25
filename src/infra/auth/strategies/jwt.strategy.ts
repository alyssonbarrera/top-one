import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'

import { ExtractJwt, Strategy } from 'passport-jwt'
import { z } from 'zod'

import { EnvService } from '@/infra/env/env.service'

import { JWT_ALGORITHM } from '../security'

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  role: z.enum(['VENDOR', 'ADMIN']),
})

export type UserPayload = z.infer<typeof tokenPayloadSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: EnvService) {
    const publicKey = config.get('JWT_PUBLIC_KEY')

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: publicKey,
      algorithms: [JWT_ALGORITHM],
    })
  }

  async validate(payload: UserPayload) {
    return tokenPayloadSchema.parse(payload)
  }
}
