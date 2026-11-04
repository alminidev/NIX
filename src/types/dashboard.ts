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

/** Recorte mensal da dashboard. `month` null mostra todos os meses. */
export interface IDashboardPeriod {
  /** YYYY-MM, ou null para todos os meses */
  month: string | null;
  /** "Novembro de 2026"; null quando não há mês */
  label: string | null;
  /** YYYY-MM de agora em Brasília; teto do seletor */
  currentMonth: string;
}

export interface IDashboardMetrics {
  /** Todos os pedidos, de qualquer status */
  orders: number;
  /** Pedidos por status, na ordem do ciclo de vida (inclui os zerados) */
  ordersByStatus: IOrdersByStatus[];
  /** Pedidos aguardando pagamento (seguram estoque até expirar) */
  awaitingPayment: number;
  /** Pagamentos conferidos que precisam de revisão manual */
  paymentReviews: number;
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
