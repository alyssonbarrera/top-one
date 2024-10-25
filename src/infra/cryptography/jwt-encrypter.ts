import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { Encrypter } from '@/domain/user/application/cryptography/encrypter'

import { JWT_ALGORITHM } from '../auth/security'
import { EnvService } from '../env/env.service'

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(
    private jwtService: JwtService,
    private config: EnvService,
  ) {}

  encrypt(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload, {
      algorithm: JWT_ALGORITHM,
      privateKey: this.config.get('JWT_PRIVATE_KEY'),
    })
  }
}
