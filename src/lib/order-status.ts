import type { OrderStatus } from "@/generated/prisma/enums";

/** Todos os status do pedido, na ordem do ciclo de vida. */
export const orderStatuses: OrderStatus[] = [
  "AWAITING_PAYMENT",
  "PAID",
  "IN_PRODUCTION",
  "READY",
  "SHIPPED",
  "CANCELLED",
  "EXPIRED",
];

export const orderStatusLabels: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "Aguardando pagamento",
  PAID: "Pago",
  IN_PRODUCTION: "Em produção",
  READY: "Pronto",
  SHIPPED: "Enviado",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

/**
 * Status que contam como receita: do pagamento em diante (PAID, IN_PRODUCTION,
 * READY, SHIPPED). Fora dela ficam AWAITING_PAYMENT (ainda não pagou) e
 * CANCELLED e EXPIRED (o dinheiro não entrou ou foi devolvido).
 */
export const paidOrderStatuses: OrderStatus[] = [
  "PAID",
  "IN_PRODUCTION",
  "READY",
  "SHIPPED",
];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return orderStatuses.includes(value as OrderStatus);
}

/**
 * Mudanças de status que o admin pode fazer à mão, um passo de cada vez (com
 * volta, para corrigir um clique errado):
 * aguardando pagamento → pago → em produção → pronto → enviado.
 * Cancelar só vale antes da produção e devolve o estoque (cancelOrder).
 * Cancelado e expirado são finais, porque o estoque já voltou; EXPIRED só
 * acontece sozinho, pelo prazo de pagamento. Pago não volta para aguardando,
 * já que o prazo antigo expiraria o pedido na hora.
 */
const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  AWAITING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["IN_PRODUCTION", "CANCELLED"],
  IN_PRODUCTION: ["PAID", "READY"],
  READY: ["IN_PRODUCTION", "SHIPPED"],
  SHIPPED: ["READY"],
  CANCELLED: [],
  EXPIRED: [],
};

export function getNextOrderStatuses(status: OrderStatus): OrderStatus[] {
  return nextStatuses[status];
}

/** Status de origem a partir dos quais `to` é uma mudança permitida. */
export function getPreviousOrderStatuses(to: OrderStatus): OrderStatus[] {
  return orderStatuses.filter((status) => nextStatuses[status].includes(to));
}

export function canChangeOrderStatus(from: OrderStatus, to: OrderStatus) {
  return nextStatuses[from].includes(to);
}
