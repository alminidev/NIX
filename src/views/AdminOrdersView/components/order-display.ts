import type { OrderStatus } from "@/generated/prisma/enums";

export const currencyFormat = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function formatOrderDate(date: Date) {
  return dateFormat.format(date);
}

export const statusLabels: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "Aguardando pagamento",
  PAID: "Pago",
  IN_PRODUCTION: "Em produção",
  READY: "Pronto",
  SHIPPED: "Enviado",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

const neutralBadge =
  "rounded-pill bg-surface-canvas-fog px-2 py-0.5 text-[0.6875rem] font-bold tracking-[0.04em] text-ink-muted uppercase";
const activeBadge =
  "rounded-pill bg-brand-blue-subtle px-2 py-0.5 text-[0.6875rem] font-bold tracking-[0.04em] text-brand-blue-hover uppercase";
const warningBadge =
  "rounded-pill bg-[#fff1f1] px-2 py-0.5 text-[0.6875rem] font-bold tracking-[0.04em] text-[#9b1c1c] uppercase";

export const statusBadgeClasses: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: neutralBadge,
  PAID: activeBadge,
  IN_PRODUCTION: activeBadge,
  READY: activeBadge,
  SHIPPED: activeBadge,
  CANCELLED: warningBadge,
  EXPIRED: warningBadge,
};
