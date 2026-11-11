import { isOrderStatus } from "@/lib/order-status";
import type { OrderStatus } from "@/generated/prisma/enums";

/** Tamanho máximo do código de rastreio. */
export const trackingCodeMaxLength = 40;

export interface IOrderStatusInput {
  id: number;
  status: OrderStatus;
  /** null quando não foi informado */
  trackingCode: string | null;
}

export type TOrderStatusFormResult =
  { input: IOrderStatusInput; error: null } | { input: null; error: string };

/** Lê o formulário de mudança de status; devolve a mensagem de erro se inválido. */
export function readOrderStatusForm(
  formData: FormData,
): TOrderStatusFormResult {
  const rawId = formData.get("id");
  const status = formData.get("status");
  const rawTracking = formData.get("trackingCode");

  const id =
    typeof rawId === "string" && /^\d{1,10}$/.test(rawId) ? Number(rawId) : 0;
  if (id < 1 || id > 2_147_483_647) {
    return { input: null, error: "Pedido inválido." };
  }

  if (!isOrderStatus(status)) {
    return { input: null, error: "Escolha um status." };
  }

  const trackingCode =
    typeof rawTracking === "string" ? rawTracking.trim() : "";

  if (trackingCode.length > trackingCodeMaxLength) {
    return {
      input: null,
      error: `O código de rastreio pode ter até ${trackingCodeMaxLength} caracteres.`,
    };
  }

  if (trackingCode && !/^[A-Za-z0-9][A-Za-z0-9 ._/-]*$/.test(trackingCode)) {
    return {
      input: null,
      error: "Use só letras, números e - . _ / no código de rastreio.",
    };
  }

  return {
    input: { id, status, trackingCode: trackingCode || null },
    error: null,
  };
}
