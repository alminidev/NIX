/**
 * Contrato da lista de pedidos no painel.
 * getAdminOrders() em lib/admin-orders.ts recebe IAdminOrderFilters e devolve
 * IAdminOrderPage; parseOrderFilters() em lib/admin-order-filters.ts monta os
 * filtros a partir dos searchParams da página.
 */

import type { OrderStatus } from "@/generated/prisma/enums";

export interface IAdminOrder {
  id: number;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  /** Total em reais */
  total: number;
  /** Soma das quantidades dos itens */
  itemCount: number;
  createdAt: Date;
}

export interface IAdminOrderFilters {
  /** Busca por nome, e-mail ou número do pedido; vazio = sem busca */
  q: string;
  status: OrderStatus | null;
  /** Primeiro dia (AAAA-MM-DD, horário de Brasília), inclusive */
  from: string | null;
  /** Último dia (AAAA-MM-DD, horário de Brasília), inclusive */
  to: string | null;
  /** Página pedida, a partir de 1 */
  page: number;
}

export interface IAdminOrderPage {
  orders: IAdminOrder[];
  /** Pedidos que atendem aos filtros, somando todas as páginas */
  total: number;
  /** Página devolvida (ajustada ao intervalo existente) */
  page: number;
  pageSize: number;
  pageCount: number;
}
