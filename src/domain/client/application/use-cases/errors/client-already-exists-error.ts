import { UseCaseError } from '@/core/errors/use-case-error'

export class ClientAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super(`Client with same email already exists`)
  }
}
