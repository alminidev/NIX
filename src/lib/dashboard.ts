import "server-only";
import { prisma } from "@/lib/prisma";
import type { IDashboardMetrics } from "@/types/dashboard";

export async function getDashboardMetrics(): Promise<IDashboardMetrics> {
  const [activeProducts, categories, featuredCount, aggregates, featuredProducts] =
    await Promise.all([
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
        orderBy: { sortOrder: "asc" },
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
    averagePrice:
      aggregates._avg.price == null ? null : Number(aggregates._avg.price),
    catalogValue:
      aggregates._sum.price == null ? 0 : Number(aggregates._sum.price),
    categories,
    featuredCount,
    featuredProducts: featuredProducts.map((product) => ({
      name: product.name,
      category: product.category.name,
      price: Number(product.price),
    })),
  };
}
