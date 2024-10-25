import { JwtService } from '@nestjs/jwt'

import { JWT_ALGORITHM } from '@/infra/auth/security'

type MakeAccessTokenProps = {
  sub: string
  role: string
  service: JwtService
}

export function makeAccessToken({ sub, role, service }: MakeAccessTokenProps) {
  const accessToken = service.sign(
    {
      sub,
      role,
    },
    {
      algorithm: JWT_ALGORITHM,
      privateKey: process.env.JWT_PRIVATE_KEY,
    },
  )

  return accessToken
}
