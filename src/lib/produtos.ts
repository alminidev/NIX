import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Produto } from '@/types/produto';

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export async function getProdutos(): Promise<Produto[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('produtos');

  const produtos = await prisma.produto.findMany({
    where: { ativo: true },
    orderBy: { ordem: 'asc' },
    include: {
      categoria: true,
      especificacoes: { orderBy: { ordem: 'asc' } },
      imagens: { orderBy: { ordem: 'asc' } },
    },
  });

  return produtos.map((produto) => {
    const principal =
      produto.imagens.find((imagem) => imagem.principal) ?? produto.imagens[0];
    const urls = produto.imagens.map((imagem) => imagem.url);

    return {
      id: produto.id,
      sku: produto.sku,
      nome: produto.nome,
      categoria: produto.categoria.nome,
      capacidade: produto.capacidade,
      dimensoes: produto.dimensoes,
      preco: Number(produto.preco),
      precoFormatado: moeda.format(Number(produto.preco)),
      parcelamento: produto.parcelamento,
      descricao: produto.descricao,
      especificacoes: produto.especificacoes.map((item) => item.texto),
      imagem: principal?.url ?? '',
      imagens: urls.length > 1 ? urls : undefined,
      destaque: produto.destaque,
    };
  });
}
