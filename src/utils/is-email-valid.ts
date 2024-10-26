import { z } from 'zod'

/**
 * Validates whether a given email address is in a proper format.
 *
 * This function uses the `zod` library to check if the provided email string
 * conforms to a standard email format.
 *
 * @param email - The email address to validate.
 * @returns `true` if the email is valid, `false` otherwise.
 */
export function isEmailValid(email: string): boolean {
  return z.string().email().safeParse(email).success
}
