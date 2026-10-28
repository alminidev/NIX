"use client";

import { updateOrderStatus } from "@/app/admin/orders/actions";
import { trackingCodeMaxLength } from "@/lib/admin-order-input";
import { getNextOrderStatuses, orderStatusLabels } from "@/lib/order-status";
import type { OrderStatus } from "@/generated/prisma/enums";
import { orderStatusInitialState } from "@/types/admin-order";
import OrderCard from "@/views/AdminOrderView/components/OrderCard";
import { statusBadgeClasses } from "@/views/AdminOrdersView/components/order-display";
import { useActionState, useState, useTransition } from "react";

interface IOrderStatusFormProps {
  orderId: number;
  status: OrderStatus;
  trackingCode: string | null;
}

const controlClass =
  "min-h-11 w-full rounded-pill border border-border-hairline bg-surface-card px-4 text-sm text-ink-primary focus:border-brand-blue focus:outline-2 focus:outline-offset-1 focus:outline-border-focus";

const labelClass =
  "mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary";

const finalMessages: Partial<Record<OrderStatus, string>> = {
  CANCELLED: "Pedido cancelado. O estoque já voltou e o status não muda mais.",
  EXPIRED:
    "O prazo para pagar passou. O estoque já voltou e o status não muda mais.",
};

/**
 * Mudança manual de status. Só aparecem as mudanças permitidas para o status
 * atual (getNextOrderStatuses); o servidor confere de novo ao salvar.
 */
export default function OrderStatusForm({
  orderId,
  status,
  trackingCode,
}: IOrderStatusFormProps) {
  const next = getNextOrderStatuses(status);
  const [selected, setSelected] = useState<OrderStatus>(next[0] ?? status);
  const [state, action, pending] = useActionState(
    updateOrderStatus,
    orderStatusInitialState,
  );
  const [, startTransition] = useTransition();
  // Depois de salvar, o status muda e as opções mudam junto.
  const target = next.includes(selected) ? selected : next[0];
  const cancelling = target === "CANCELLED";

  // O formulário não usa a prop action para o React não limpar os campos
  // depois de um erro (o mesmo cuidado do CheckoutForm).
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(() => action(formData));
  }

  return (
    <OrderCard id="status-pedido" title="Status">
      <div className="flex flex-wrap items-center gap-2">
        <span className={statusBadgeClasses[status]}>
          {orderStatusLabels[status]}
        </span>
        {trackingCode ? (
          <span className="text-[0.8125rem] text-ink-secondary">
            Rastreio:{" "}
            <strong className="font-semibold break-all text-ink-primary">
              {trackingCode}
            </strong>
          </span>
        ) : null}
      </div>

      {next.length === 0 ? (
        <p className="mt-4 text-[0.875rem] text-ink-secondary">
          {finalMessages[status]}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="id" value={orderId} />

          <label className="block">
            <span className={labelClass}>Mudar para</span>
            <select
              name="status"
              value={target}
              onChange={(event) =>
                setSelected(event.target.value as OrderStatus)
              }
              disabled={pending}
              className={controlClass}
            >
              {next.map((option) => (
                <option key={option} value={option}>
                  {orderStatusLabels[option]}
                </option>
              ))}
            </select>
          </label>

          {target === "SHIPPED" ? (
            <label className="block">
              <span className={labelClass}>
                Código de rastreio{" "}
                <span className="font-normal text-ink-muted">(opcional)</span>
              </span>
              <input
                type="text"
                name="trackingCode"
                defaultValue={trackingCode ?? ""}
                maxLength={trackingCodeMaxLength}
                autoComplete="off"
                disabled={pending}
                className={controlClass}
              />
            </label>
          ) : null}

          {cancelling ? (
            <p className="text-[0.8125rem] text-[#9b1c1c]">
              Cancelar devolve o estoque dos itens e não pode ser desfeito.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className={
              cancelling
                ? "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill bg-[#9b1c1c] px-6 text-sm font-semibold text-ink-inverse transition-[background-color] duration-200 ease-nix hover:bg-[#7f1616] disabled:cursor-progress disabled:opacity-70"
                : "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill bg-brand-blue px-6 text-sm font-semibold text-ink-inverse transition-[background-color] duration-200 ease-nix hover:bg-brand-blue-hover disabled:cursor-progress disabled:opacity-70"
            }
          >
            {pending
              ? "Salvando…"
              : cancelling
                ? "Cancelar pedido"
                : "Atualizar status"}
          </button>
        </form>
      )}

      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "mt-3 text-sm text-[#9b1c1c]"
              : "mt-3 text-sm text-ink-secondary"
          }
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
    </OrderCard>
  );
}
