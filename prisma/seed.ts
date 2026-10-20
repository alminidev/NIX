import { MissingEnvironmentVariableError } from '../src/app/_errors/missing-environment-variable.error';
import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { CATEGORIES, PRODUCTS } from './catalog';

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin';
const ADMIN_NAME = 'Administrador';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new MissingEnvironmentVariableError('DATABASE_URL');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function seedAdmin() {
  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: ADMIN_NAME,
        role: 'admin',
        emailVerified: true,
      },
    });

    const account = await prisma.account.findFirst({
      where: { userId: existing.id, providerId: 'credential' },
    });

    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          accountId: existing.id,
          password: passwordHash,
        },
      });
      return;
    }

    await prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: existing.id,
        providerId: 'credential',
        userId: existing.id,
        password: passwordHash,
      },
    });
    return;
  }

  const userId = randomUUID();

  await prisma.user.create({
    data: {
      id: userId,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      emailVerified: true,
      role: 'admin',
      accounts: {
        create: {
          id: randomUUID(),
          accountId: userId,
          providerId: 'credential',
          password: passwordHash,
        },
      },
    },
  });
}

async function main() {
  await seedAdmin();

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
      },
      create: category,
    });
  }

  for (const product of PRODUCTS) {
    const data = {
      sku: product.sku,
      name: product.name,
      capacity: product.capacity,
      dimensions: product.dimensions,
      price: product.price,
      installments: product.installments,
      description: product.description,
      featured: product.featured,
      active: true,
      sortOrder: product.sortOrder,
      category: {
        connect: { slug: product.categorySlug },
      },
    };

    const saved = await prisma.product.upsert({
      where: { sku: product.sku },
      update: data,
      create: data,
    });

    await prisma.specification.deleteMany({ where: { productId: saved.id } });
    await prisma.productImage.deleteMany({ where: { productId: saved.id } });

    await prisma.specification.createMany({
      data: product.specifications.map((text, sortOrder) => ({
        text,
        sortOrder,
        productId: saved.id,
      })),
    });

    await prisma.productImage.createMany({
      data: product.images.map((image, sortOrder) => ({
        url: image.url,
        sortOrder,
        isPrimary: image.isPrimary ?? sortOrder === 0,
        productId: saved.id,
      })),
    });
  }

  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('category', 'id'),
      COALESCE((SELECT MAX(id) FROM category), 1)
    )
  `;
  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('product', 'id'),
      COALESCE((SELECT MAX(id) FROM product), 1)
    )
  `;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
