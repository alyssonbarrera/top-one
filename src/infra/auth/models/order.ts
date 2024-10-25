import { z } from 'zod'

import { OrderStatus } from '@/core/enums/order-status'

export const orderSchema = z.object({
  __typename: z.literal('Order').default('Order'),
  id: z.string().optional(),
  vendorId: z.string(),
  status: z.nativeEnum(OrderStatus).default(OrderStatus.PROCESSING),
})

export type Order = z.infer<typeof orderSchema>
