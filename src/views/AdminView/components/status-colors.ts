import type { OrderStatus } from "@/generated/prisma/enums";

/**
 * Cor de cada status nos gráficos do dashboard: cinza para o que espera,
 * azul cada vez mais forte ao longo do ciclo e vermelho para o que não vingou.
 */
export const statusDotClasses: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "bg-[#b9c0cc]",
  PAID: "bg-[#8db5ff]",
  IN_PRODUCTION: "bg-[#5b97ff]",
  READY: "bg-brand-blue",
  SHIPPED: "bg-[#0f4fc4]",
  CANCELLED: "bg-[#d98a8a]",
  EXPIRED: "bg-[#efc3c3]",
};
