import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { CATEGORIAS, PRODUTOS } from './catalogo';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não está definida.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
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
