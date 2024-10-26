import { vi } from 'vitest'

import { Role, userSchema } from '@/infra/auth/abac'

import { getUserPermissions } from './get-user-permissions'

const mocks = vi.hoisted(() => {
  return {
    defineAbilityFor: vi.fn(),
  }
})

vi.mock('@/infra/auth/abac', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>

  return {
    ...actual,
    defineAbilityFor: mocks.defineAbilityFor,
  }
})

describe('getUserPermissions', () => {
  const mockUserId = '12345'
  const mockRole: Role = 'ADMIN'

  beforeEach(() => {
    vi.spyOn(userSchema, 'parse').mockImplementation(() => ({
      __typename: 'User',
      id: mockUserId,
      role: mockRole,
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should parse the user schema with the provided userId and role', () => {
    getUserPermissions(mockUserId, mockRole)
    expect(userSchema.parse).toHaveBeenCalledWith({
      id: mockUserId,
      role: mockRole,
    })
  })

  it('should define the ability for the provided role', () => {
    getUserPermissions(mockUserId, mockRole)
    expect(mocks.defineAbilityFor).toHaveBeenCalled()
    expect(mocks.defineAbilityFor).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockUserId,
        role: mockRole,
      }),
    )
  })

  it('should return the ability object', () => {
    const mockAbility = { can: vi.fn(), cannot: vi.fn() }
    mocks.defineAbilityFor.mockReturnValue(mockAbility)

    const ability = getUserPermissions(mockUserId, mockRole)

    expect(ability).toBe(mockAbility)
  })
})
