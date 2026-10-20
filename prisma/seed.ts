import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { CATEGORIAS, PRODUTOS } from './catalogo';

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin';
const ADMIN_NAME = 'Administrador';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não está definida.');
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

  for (const categoria of CATEGORIAS) {
    await prisma.categoria.upsert({
      where: { slug: categoria.slug },
      update: {
        nome: categoria.nome,
        ordem: categoria.ordem,
      },
      create: categoria,
    });
  }

  for (const produto of PRODUTOS) {
    const dados = {
      sku: produto.sku,
      nome: produto.nome,
      capacidade: produto.capacidade,
      dimensoes: produto.dimensoes,
      preco: produto.preco,
      parcelamento: produto.parcelamento,
      descricao: produto.descricao,
      destaque: produto.destaque,
      ativo: true,
      ordem: produto.ordem,
      categoria: {
        connect: { slug: produto.categoriaSlug },
      },
    };

    const salvo = await prisma.produto.upsert({
      where: { sku: produto.sku },
      update: dados,
      create: dados,
    });

    await prisma.especificacao.deleteMany({ where: { produtoId: salvo.id } });
    await prisma.produtoImagem.deleteMany({ where: { produtoId: salvo.id } });

    await prisma.especificacao.createMany({
      data: produto.especificacoes.map((texto, ordem) => ({
        texto,
        ordem,
        produtoId: salvo.id,
      })),
    });

    await prisma.produtoImagem.createMany({
      data: produto.imagens.map((imagem, ordem) => ({
        url: imagem.url,
        ordem,
        principal: imagem.principal ?? ordem === 0,
        produtoId: salvo.id,
      })),
    });
  }

  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('categoria', 'id'),
      COALESCE((SELECT MAX(id) FROM categoria), 1)
    )
  `;
  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('produto', 'id'),
      COALESCE((SELECT MAX(id) FROM produto), 1)
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
