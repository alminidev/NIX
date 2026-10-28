import {
  adminOrdersPageSize,
  getOrderDateRange,
  parseOrderIdSearch,
} from "@/lib/admin-order-filters";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { IAdminOrderFilters, IAdminOrderPage } from "@/types/admin-order";
import "server-only";

function buildWhere(filters: IAdminOrderFilters): Prisma.OrderWhereInput {
  const { gte, lt } = getOrderDateRange(filters);
  const query = filters.q.trim();
  const orderId = parseOrderIdSearch(query);

  const search: Prisma.OrderWhereInput[] = query
    ? [
        { customerName: { contains: query, mode: "insensitive" } },
        { customerEmail: { contains: query, mode: "insensitive" } },
        ...(orderId === null ? [] : [{ id: orderId }]),
      ]
    : [];

  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(gte || lt
      ? { createdAt: { ...(gte ? { gte } : {}), ...(lt ? { lt } : {}) } }
      : {}),
    ...(search.length > 0 ? { OR: search } : {}),
  };
}

export async function getAdminOrders(
  filters: IAdminOrderFilters,
): Promise<IAdminOrderPage> {
  const where = buildWhere(filters);
  const total = await prisma.order.count({ where });

  const pageCount = Math.max(1, Math.ceil(total / adminOrdersPageSize));
  const page = Math.min(Math.max(1, filters.page), pageCount);

  const orders = await prisma.order.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * adminOrdersPageSize,
    take: adminOrdersPageSize,
    select: {
      id: true,
      status: true,
      customerName: true,
      customerEmail: true,
      total: true,
      createdAt: true,
      items: { select: { quantity: true } },
    },
  });

  return {
    orders: orders.map((order) => ({
      id: order.id,
      status: order.status,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      total: Number(order.total),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt,
    })),
    total,
    page,
    pageSize: adminOrdersPageSize,
    pageCount,
  };
}
