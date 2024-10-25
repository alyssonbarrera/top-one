import { UseCaseError } from '@/core/errors/use-case-error'

export class ForbiddenError extends Error implements UseCaseError {
  constructor(action: string, subject: string) {
    super(
      `You are not allowed to execute the action ${action.toUpperCase()} on the subject ${subject.toUpperCase()}.`,
    )
  }
}
