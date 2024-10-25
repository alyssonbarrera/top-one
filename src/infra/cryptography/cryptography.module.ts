import { Module } from '@nestjs/common'

import { Encrypter } from '@/domain/user/application/cryptography/encrypter'
import { HashComparer } from '@/domain/user/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/user/application/cryptography/hash-generator'

import { EnvModule } from '../env/env.module'

import { BcryptHasher } from './bcrypt-hasher'
import { JwtEncrypter } from './jwt-encrypter'

@Module({
  imports: [EnvModule],
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
