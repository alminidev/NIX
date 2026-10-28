/**
 * Contrato da lista de pedidos no painel.
 * getAdminOrders() em lib/admin-orders.ts devolve objetos neste formato.
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
