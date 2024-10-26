import { isEmailValid } from './is-email-valid'

describe('isEmailValid', () => {
  it('should be able to return true for a valid email', () => {
    const validEmail = 'test@example.com'
    expect(isEmailValid(validEmail)).toBe(true)
  })

  it('should be able to return false for an invalid email', () => {
    const invalidEmail = 'invalid-email'
    expect(isEmailValid(invalidEmail)).toBe(false)
  })

  it('should be able to return false for an empty string', () => {
    const emptyEmail = ''
    expect(isEmailValid(emptyEmail)).toBe(false)
  })

  it('should be able to return false for an email without domain', () => {
    const emailWithoutDomain = 'test@'
    expect(isEmailValid(emailWithoutDomain)).toBe(false)
  })

  it('should be able to return false for an email without username', () => {
    const emailWithoutUsername = '@example.com'
    expect(isEmailValid(emailWithoutUsername)).toBe(false)
  })

  it('should be able to return false for an email with spaces', () => {
    const emailWithSpaces = 'test @example.com'
    expect(isEmailValid(emailWithSpaces)).toBe(false)
  })
})
