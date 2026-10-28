/**
 * Contrato da lista de pedidos no painel.
 * getAdminOrders() em lib/admin-orders.ts recebe IAdminOrderFilters e devolve
 * IAdminOrderPage; parseOrderFilters() em lib/admin-order-filters.ts monta os
 * filtros a partir dos searchParams da página.
 */

import type { OrderSource, OrderStatus } from "@/generated/prisma/enums";

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

/** Item do pedido, com o produto e o preço congelados na hora da compra. */
export interface IAdminOrderItem {
  id: number;
  productId: number;
  name: string;
  sku: string;
  /** Foto principal do produto; vazio quando não há */
  image: string;
  quantity: number;
  /** Preço unitário em reais, o do momento do pedido */
  unitPrice: number;
  /** unitPrice vezes quantity */
  lineTotal: number;
}

/**
 * Contrato da página de um pedido (/admin/orders/[id]).
 * getAdminOrder() em lib/admin-orders.ts devolve objetos neste formato.
 */
export interface IAdminOrderDetail {
  id: number;
  status: OrderStatus;
  source: OrderSource;
  customer: {
    name: string;
    email: string;
    /** Só dígitos, com DDD */
    phone: string;
  };
  address: {
    /** CEP, só dígitos (8) */
    postalCode: string;
    street: string;
    number: string;
    /** Vazio quando não há complemento */
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  items: IAdminOrderItem[];
  /** Soma das quantidades dos itens */
  itemCount: number;
  subtotal: number;
  /** Frete em reais; null enquanto não houve cotação */
  shipping: number | null;
  total: number;
  trackingCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  /** Prazo para pagar; só vale enquanto o pedido aguarda pagamento */
  expiresAt: Date | null;
}

export interface IOrderStatusState {
  status: "idle" | "error" | "success";
  message: string;
}

export const orderStatusInitialState: IOrderStatusState = {
  status: "idle",
  message: "",
};
