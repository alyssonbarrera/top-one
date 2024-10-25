import type { AbilityBuilder } from '@casl/ability'

import { OrderStatus } from '@/core/enums/order-status'

import { User } from './models/user'
import { Role } from './roles'

import type { AppAbility } from './index'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN: (_user, { can, cannot }) => {
    can('manage', 'all')
    can('change-password', 'User')

    can(
      ['manage', 'create', 'get', 'update', 'delete', 'apply-discount'],
      'Product',
    )

    can(['manage', 'create', 'get', 'update', 'delete'], 'Client')

    cannot('manage', 'Order')
  },

  VENDOR: (user, { can, cannot }) => {
    can(['manage', 'get', 'update', 'update-status', 'delete'], 'Order', {
      vendorId: {
        $eq: user.id,
      },
    })

    can('create', 'Order')

    cannot('update', 'Order', {
      status: {
        $eq: OrderStatus.SENT,
      },
    })

    cannot('update-status', 'Order', {
      status: {
        $eq: OrderStatus.DELIVERED,
      },
    })

    cannot('delete', 'Order', {
      status: {
        $nin: [OrderStatus.PROCESSING, OrderStatus.DELIVERED],
      },
    })

    can('manage', 'User', {
      id: {
        $eq: user.id,
      },
    })

    cannot('change-password', 'User')
  },
}
