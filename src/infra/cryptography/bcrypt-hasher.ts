import { hash, compare } from 'bcryptjs'

import { HashComparer } from '@/domain/user/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/user/application/cryptography/hash-generator'

import { DEFAULT_SALT_ROUNDS } from '../auth/security'

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = DEFAULT_SALT_ROUNDS

  hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH)
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }
}
