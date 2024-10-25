import { UseCaseError } from '@/core/errors/use-case-error'

export class ProductNotFoundError extends Error implements UseCaseError {
  constructor() {
    super(`Product not found`)
  }
}
