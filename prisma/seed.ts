import { PrismaClient, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'
import { v7 as randomUUID } from 'uuid'

import { DEFAULT_SALT_ROUNDS } from '../src/infra/auth/security'

const prisma = new PrismaClient()

async function seed() {
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()
  await prisma.client.deleteMany()
  await prisma.order.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.cartItem.deleteMany()

  const passwordHash = await hash('123456', DEFAULT_SALT_ROUNDS)

  await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'John Doe',
      email: 'john@acme.com',
      password: passwordHash,
      role: UserRole.VENDOR,
    },
  })

  await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'John Doe',
      email: 'admin@acme.com',
      password: passwordHash,
      role: UserRole.ADMIN,
    },
  })
}

seed()
  .then(async () => {
    console.log('Database seeded!')
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
