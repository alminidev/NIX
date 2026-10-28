/**
 * Contrato de exibição do painel administrativo.
 * getDashboardMetrics() em lib/dashboard.ts devolve objetos neste formato.
 */

import type { OrderStatus } from "@/generated/prisma/enums";

export interface IFeaturedProduct {
  id: number;
  name: string;
  category: string;
  price: number;
}

export interface IOutOfStockProduct {
  id: number;
  name: string;
  sku: string;
  category: string;
}

export interface IOrdersByStatus {
  status: OrderStatus;
  count: number;
}

export interface IDashboardMetrics {
  /** Todos os pedidos, de qualquer status */
  orders: number;
  /** Pedidos por status, na ordem do ciclo de vida (inclui os zerados) */
  ordersByStatus: IOrdersByStatus[];
  /** Pedidos aguardando pagamento (seguram estoque até expirar) */
  awaitingPayment: number;
  /** Pedidos que contam como receita (paidOrderStatuses em lib/order-status.ts) */
  paidOrders: number;
  /** Soma do total dos pedidos pagos, em reais */
  revenue: number;
  /** Receita dividida pelos pedidos pagos; null sem pedidos pagos */
  averageTicket: number | null;
  activeProducts: number;
  averagePrice: number | null;
  catalogValue: number;
  categories: number;
  featuredCount: number;
  featuredProducts: IFeaturedProduct[];
  outOfStock: IOutOfStockProduct[];
}
