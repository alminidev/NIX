import 'server-only';
import { prisma } from '@/lib/prisma';

export type FeaturedProduct = {
  name: string;
  category: string;
  price: number;
};

export type DashboardMetrics = {
  orders: number;
  revenue: number;
  averageTicket: number | null;
  activeProducts: number;
  averagePrice: number | null;
  catalogValue: number;
  categories: number;
  featuredCount: number;
  featuredProducts: FeaturedProduct[];
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [activeProducts, categories, featuredCount, aggregates, featuredProducts] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.category.count(),
    prisma.product.count({ where: { active: true, featured: true } }),
    prisma.product.aggregate({
      where: { active: true },
      _avg: { price: true },
      _sum: { price: true },
    }),
    prisma.product.findMany({
      where: { active: true, featured: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        name: true,
        price: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  return {
    orders: 0,
    revenue: 0,
    averageTicket: null,
    activeProducts,
    averagePrice: aggregates._avg.price == null ? null : Number(aggregates._avg.price),
    catalogValue: aggregates._sum.price == null ? 0 : Number(aggregates._sum.price),
    categories,
    featuredCount,
    featuredProducts: featuredProducts.map((product) => ({
      name: product.name,
      category: product.category.name,
      price: Number(product.price),
    })),
  };
}
