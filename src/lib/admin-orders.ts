import {
  adminOrdersPageSize,
  escapeLikePattern,
  getOrderDateRange,
  parseOrderIdSearch,
} from "@/lib/admin-order-filters";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  IAdminOrderDetail,
  IAdminOrderFilters,
  IAdminOrderPage,
} from "@/types/admin-order";
import "server-only";

function buildWhere(filters: IAdminOrderFilters): Prisma.OrderWhereInput {
  const { gte, lt } = getOrderDateRange(filters);
  const query = filters.q.trim();
  const orderId = parseOrderIdSearch(query);
  const pattern = escapeLikePattern(query);

  const search: Prisma.OrderWhereInput[] = query
    ? [
        { customerName: { contains: pattern, mode: "insensitive" } },
        { customerEmail: { contains: pattern, mode: "insensitive" } },
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

/** Um pedido com itens, cliente, endereço, valores e datas; null se não existe. */
export async function getAdminOrder(
  id: number,
): Promise<IAdminOrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { id: "asc" },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              images: {
                orderBy: { sortOrder: "asc" },
                select: { url: true, isPrimary: true },
              },
            },
          },
        },
      },
    },
  });

  if (!order) return null;

  const items = order.items.map((item) => {
    const primary =
      item.product.images.find((image) => image.isPrimary) ??
      item.product.images[0];
    const unitPrice = Number(item.unitPrice);

    return {
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      sku: item.product.sku,
      image: primary?.url ?? "",
      quantity: item.quantity,
      unitPrice,
      // Centavos inteiros para não acumular erro de ponto flutuante.
      lineTotal: Math.round(unitPrice * 100 * item.quantity) / 100,
    };
  });

  return {
    id: order.id,
    status: order.status,
    source: order.source,
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
    },
    address: {
      postalCode: order.postalCode,
      street: order.street,
      number: order.number,
      complement: order.complement ?? "",
      neighborhood: order.neighborhood,
      city: order.city,
      state: order.state,
    },
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: Number(order.subtotal),
    shipping: order.shipping === null ? null : Number(order.shipping),
    total: Number(order.total),
    trackingCode: order.trackingCode,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    expiresAt: order.expiresAt,
  };
}
