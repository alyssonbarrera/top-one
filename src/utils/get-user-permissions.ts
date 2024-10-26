import { defineAbilityFor, Role, userSchema } from '@/infra/auth/abac'

/**
 * Retrieves the permissions for a given user based on their role.
 *
 * @param userId - The unique identifier of the user.
 * @param role - The role of the user which determines their permissions.
 * @returns The ability object that defines the user's permissions.
 */
export function getUserPermissions(userId: string, role: Role) {
  const authUser = userSchema.parse({
    id: userId,
    role,
  })

  const ability = defineAbilityFor(authUser)

  return ability
}
