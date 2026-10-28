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
