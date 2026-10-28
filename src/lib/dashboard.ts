import "server-only";
import { orderStatuses, paidOrderStatuses } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";
import type { IDashboardMetrics } from "@/types/dashboard";

export async function getDashboardMetrics(): Promise<IDashboardMetrics> {
  const [
    activeProducts,
    categories,
    featuredCount,
    aggregates,
    featuredProducts,
    outOfStock,
    orderGroups,
  ] = await Promise.all([
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
        id: true,
        name: true,
        price: true,
        category: { select: { name: true } },
      },
    }),
    prisma.product.findMany({
      where: { stock: 0 },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        sku: true,
        category: { select: { name: true } },
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { total: true },
    }),
  ]);

  const ordersByStatus = orderStatuses.map((status) => ({
    status,
    count:
      orderGroups.find((group) => group.status === status)?._count._all ?? 0,
  }));

  const paidGroups = orderGroups.filter((group) =>
    paidOrderStatuses.includes(group.status),
  );
  const paidOrders = paidGroups.reduce(
    (sum, group) => sum + group._count._all,
    0,
  );
  // Centavos inteiros para não acumular erro de ponto flutuante.
  const revenueCents = paidGroups.reduce(
    (sum, group) => sum + Math.round(Number(group._sum.total ?? 0) * 100),
    0,
  );

  return {
    orders: ordersByStatus.reduce((sum, item) => sum + item.count, 0),
    ordersByStatus,
    awaitingPayment:
      ordersByStatus.find((item) => item.status === "AWAITING_PAYMENT")
        ?.count ?? 0,
    paidOrders,
    revenue: revenueCents / 100,
    averageTicket:
      paidOrders === 0 ? null : Math.round(revenueCents / paidOrders) / 100,
    activeProducts,
    averagePrice:
      aggregates._avg.price == null ? null : Number(aggregates._avg.price),
    catalogValue:
      aggregates._sum.price == null ? 0 : Number(aggregates._sum.price),
    categories,
    featuredCount,
    featuredProducts: featuredProducts.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category.name,
      price: Number(product.price),
    })),
    outOfStock: outOfStock.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category.name,
    })),
  };
}
