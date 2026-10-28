import { prisma } from "@/lib/prisma";
import type { IAdminOrder } from "@/types/admin-order";
import "server-only";

/** Quantidade de pedidos mostrados na lista do painel (os mais recentes). */
export const adminOrdersLimit = 100;

export async function getAdminOrders(): Promise<IAdminOrder[]> {
  const orders = await prisma.order.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: adminOrdersLimit,
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

  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    total: Number(order.total),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt,
  }));
}
