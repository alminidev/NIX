import 'server-only';
import { prisma } from '@/lib/prisma';

export type ProdutoDestaque = {
  nome: string;
  categoria: string;
  preco: number;
};

export type DashboardMetrics = {
  pedidos: number;
  receita: number;
  ticketMedio: number | null;
  produtosAtivos: number;
  precoMedio: number | null;
  valorCatalogo: number;
  categorias: number;
  destaques: number;
  produtosDestaque: ProdutoDestaque[];
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [produtosAtivos, categorias, destaques, agregados, produtosDestaque] = await Promise.all([
    prisma.produto.count({ where: { ativo: true } }),
    prisma.categoria.count(),
    prisma.produto.count({ where: { ativo: true, destaque: true } }),
    prisma.produto.aggregate({
      where: { ativo: true },
      _avg: { preco: true },
      _sum: { preco: true },
    }),
    prisma.produto.findMany({
      where: { ativo: true, destaque: true },
      orderBy: { ordem: 'asc' },
      select: {
        nome: true,
        preco: true,
        categoria: { select: { nome: true } },
      },
    }),
  ]);

  return {
    pedidos: 0,
    receita: 0,
    ticketMedio: null,
    produtosAtivos,
    precoMedio: agregados._avg.preco == null ? null : Number(agregados._avg.preco),
    valorCatalogo: agregados._sum.preco == null ? 0 : Number(agregados._sum.preco),
    categorias,
    destaques,
    produtosDestaque: produtosDestaque.map((produto) => ({
      nome: produto.nome,
      categoria: produto.categoria.nome,
      preco: Number(produto.preco),
    })),
  };
}
