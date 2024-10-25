import { JwtSignOptions } from '@nestjs/jwt'

export type DecrypterResponse = {
  header: { alg: string; typ: string }
  payload: {
    sub: string
    role: string
    exp: number
    iat: number
  }
  signature: string
}

export abstract class Encrypter {
  abstract encrypt(
    payload: Record<string, unknown>,
    options?: JwtSignOptions,
  ): Promise<string>
}
