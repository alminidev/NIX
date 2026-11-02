"use server";

import { submitAdminOrder } from "@/lib/admin-new-order";
import { readOrderStatusForm } from "@/lib/admin-order-input";
import { changeOrderStatus } from "@/lib/orders";
import { orderStatusLabels } from "@/lib/order-status";
import { getSession } from "@/lib/session";
import type {
  IAdminOrderFormState,
  IOrderStatusState,
} from "@/types/admin-order";
import { refresh, updateTag } from "next/cache";

async function assertAdmin() {
  const session = await getSession();
  return session?.user.role === "admin";
}

export async function updateOrderStatus(
  _previous: IOrderStatusState,
  formData: FormData,
): Promise<IOrderStatusState> {
  if (!(await assertAdmin())) {
    return { status: "error", message: "Acesso negado." };
  }

  const parsed = readOrderStatusForm(formData);
  if (!parsed.input) {
    return { status: "error", message: parsed.error };
  }

  const { id, status, trackingCode } = parsed.input;
  const result = await changeOrderStatus(id, status, trackingCode);

  if (result === "not-found") {
    return { status: "error", message: "Este pedido não existe mais." };
  }

  if (result === "not-allowed") {
    // O pedido mudou em outra aba ou por outra pessoa: a tela se atualiza.
    refresh();
    return {
      status: "error",
      message:
        "Esta mudança não vale mais para o status atual do pedido. A página foi atualizada.",
    };
  }

  // Cancelar devolve o estoque dos itens.
  if (status === "CANCELLED") updateTag("products");
  refresh();

  return {
    status: "success",
    message:
      status === "CANCELLED"
        ? "Pedido cancelado e estoque devolvido."
        : `Status alterado para ${orderStatusLabels[status].toLowerCase()}.`,
  };
}

/** Cria um pedido pelo painel. Só admin. O frete é cotado de novo no servidor. */
export async function createAdminOrder(
  _previous: IAdminOrderFormState,
  formData: FormData,
): Promise<IAdminOrderFormState> {
  const session = await getSession();
  const result = await submitAdminOrder(session?.user.role, formData);

  if (result.stockChanged) updateTag("products");
  if (result.status === "success") refresh();

  return {
    status: result.status,
    message: result.message,
    fieldErrors: result.fieldErrors,
    orderId: result.orderId,
    checkoutUrl: result.checkoutUrl,
  };
}
