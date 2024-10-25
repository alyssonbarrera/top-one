import { faker } from '@faker-js/faker'
import { PrismaClient, UserRole, Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { hash } from 'bcryptjs'
import { v7 as randomUUID } from 'uuid'

import { DEFAULT_SALT_ROUNDS } from '../src/infra/auth/security'

const prisma = new PrismaClient()

async function seed() {
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await hash('123456', DEFAULT_SALT_ROUNDS)

  const vendor = await prisma.user.create({
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
      name: 'Jane Doe',
      email: 'jane@acme.com',
      password: passwordHash,
      role: UserRole.VENDOR,
    },
  })

  const admin = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'John Doe',
      email: 'admin@acme.com',
      password: passwordHash,
      role: UserRole.ADMIN,
    },
  })

  const maxProducts = 10
  const productsToCreate: Prisma.ProductCreateManyInput[] = []

  for (let i = 0; i < maxProducts; i++) {
    productsToCreate.push({
      id: randomUUID(),
      name: `Product ${i + 1}`,
      description: `Product ${i} description`,
      price: faker.commerce.price(),
      ownerId: admin.id,
    })
  }

  await prisma.product.createMany({
    data: productsToCreate,
  })

  const client = await prisma.client.create({
    data: {
      id: randomUUID(),
      name: faker.person.fullName(),
      email: 'client@acme.com',
      address: faker.location.streetAddress(),
      phone: faker.phone.number(),
      createdByUserId: admin.id,
    },
  })

  await prisma.order.create({
    data: {
      id: randomUUID(),
      clientId: client.id,
      totalPrice: new Decimal(100),
      vendorId: vendor.id,
      orderItems: {
        createMany: {
          data: productsToCreate.map((product) => ({
            id: randomUUID(),
            productId: product.id as string,
            price: product.price as number,
            quantity: 2,
          })),
        },
      },
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
