"use client";

import { updateOrderStatus } from "@/app/admin/orders/actions";
import { trackingCodeMaxLength } from "@/lib/admin-order-input";
import { getNextOrderStatuses, orderStatusLabels } from "@/lib/order-status";
import type { OrderStatus } from "@/generated/prisma/enums";
import { orderStatusInitialState } from "@/types/admin-order";
import OrderCard from "@/views/AdminOrderView/components/OrderCard";
import { Check } from "lucide-react";
import { useActionState, useState, useTransition } from "react";

interface IOrderStatusFormProps {
  orderId: number;
  status: OrderStatus;
  trackingCode: string | null;
}

/** Caminho normal do pedido, do pagamento até o envio. */
const lifecycle = [
  "AWAITING_PAYMENT",
  "PAID",
  "IN_PRODUCTION",
  "READY",
  "SHIPPED",
] as const;

type TLifecycleStatus = (typeof lifecycle)[number];

const stepLabels: Record<TLifecycleStatus, string> = {
  AWAITING_PAYMENT: "Aguardando",
  PAID: "Pago",
  IN_PRODUCTION: "Produção",
  READY: "Pronto",
  SHIPPED: "Enviado",
};

const forwardLabels: Record<
  Exclude<TLifecycleStatus, "AWAITING_PAYMENT">,
  string
> = {
  PAID: "Marcar como pago",
  IN_PRODUCTION: "Iniciar produção",
  READY: "Marcar como pronto",
  SHIPPED: "Marcar como enviado",
};

const backLabels = {
  PAID: "Voltar para pago",
  IN_PRODUCTION: "Voltar para em produção",
  READY: "Voltar para pronto",
} as const;

const situation: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "O pagamento ainda não entrou.",
  PAID: "Pagamento confirmado. Pode ir para a produção.",
  IN_PRODUCTION: "A peça está sendo produzida.",
  READY: "Pronto para despachar.",
  SHIPPED: "O pedido já saiu para entrega.",
  CANCELLED: "O estoque voltou. Este pedido não muda mais de status.",
  EXPIRED: "O prazo de pagamento acabou e o estoque voltou.",
};

const controlClass =
  "min-h-11 w-full rounded-pill border border-border-hairline bg-surface-card px-4 text-sm text-ink-primary focus:border-brand-blue focus:outline-2 focus:outline-offset-1 focus:outline-border-focus";

const primaryButtonClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill bg-brand-blue px-6 text-sm font-semibold text-ink-inverse transition-[background-color] duration-200 ease-nix hover:bg-brand-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-progress disabled:opacity-70";

const secondaryButtonClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill border border-border-hairline bg-surface-card px-5 text-sm font-semibold text-ink-primary transition-[border-color,color] duration-200 ease-nix hover:border-brand-blue hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-progress disabled:opacity-70";

const dangerButtonClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill bg-[#9b1c1c] px-5 text-sm font-semibold text-ink-inverse transition-[background-color] duration-200 ease-nix hover:bg-[#7f1616] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-progress disabled:opacity-70";

const cancelButtonClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill border border-[#f0d0d0] bg-surface-card px-4 text-sm font-semibold text-[#9b1c1c] transition-[background-color,border-color] duration-200 ease-nix hover:border-[#e3b4b4] hover:bg-[#fff1f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-progress disabled:opacity-70";

function isLifecycleStatus(status: OrderStatus): status is TLifecycleStatus {
  return (lifecycle as readonly OrderStatus[]).includes(status);
}

/**
 * Separa o que o select misturava: o próximo passo do ciclo, a volta de um
 * passo (para corrigir) e o cancelamento, que devolve o estoque.
 */
function splitMoves(status: OrderStatus) {
  const here = isLifecycleStatus(status) ? lifecycle.indexOf(status) : -1;
  let forward: keyof typeof forwardLabels | null = null;
  let back: keyof typeof backLabels | null = null;
  let canCancel = false;

  for (const option of getNextOrderStatuses(status)) {
    if (option === "CANCELLED") {
      canCancel = true;
      continue;
    }

    if (!isLifecycleStatus(option) || here < 0) continue;

    const there = lifecycle.indexOf(option);
    if (there > here && option in forwardLabels) {
      forward = option as keyof typeof forwardLabels;
    }
    if (there < here && option in backLabels) {
      back = option as keyof typeof backLabels;
    }
  }

  return { forward, back, canCancel };
}

function buttonLabel(
  action: OrderStatus,
  pending: boolean,
  pendingAction: OrderStatus | null,
  idle: string,
) {
  return pending && pendingAction === action ? "Salvando…" : idle;
}

export default function OrderStatusForm({
  orderId,
  status,
  trackingCode,
}: IOrderStatusFormProps) {
  const { forward, back, canCancel } = splitMoves(status);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [seenStatus, setSeenStatus] = useState(status);
  const [pendingAction, setPendingAction] = useState<OrderStatus | null>(null);
  const [state, action, pending] = useActionState(
    updateOrderStatus,
    orderStatusInitialState,
  );
  const [, startTransition] = useTransition();

  if (status !== seenStatus) {
    setSeenStatus(status);
    setConfirmingCancel(false);
    setPendingAction(null);
  }

  const inFlow = isLifecycleStatus(status);
  const currentIndex = inFlow ? lifecycle.indexOf(status) : -1;
  const progress = inFlow
    ? (currentIndex / (lifecycle.length - 1)) * 100
    : 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(
      event.currentTarget,
      submitter instanceof HTMLElement ? submitter : null,
    );
    const nextStatus = formData.get("status");
    setPendingAction(
      typeof nextStatus === "string" ? (nextStatus as OrderStatus) : null,
    );
    startTransition(() => action(formData));
  }

  return (
    <OrderCard id="status-pedido" title="Andamento">
      {inFlow ? (
        <ol
          aria-label="Etapas do pedido"
          className="relative grid list-none grid-cols-5 p-0"
        >
          <span
            aria-hidden
            className="absolute top-3.5 right-[10%] left-[10%] h-px bg-border-hairline"
          >
            <span
              className="block h-full bg-brand-blue"
              style={{ width: `${progress}%` }}
            />
          </span>
          {lifecycle.map((step, index) => {
            const done = index < currentIndex;
            const current = index === currentIndex;
            const finishedHere = current && forward === null;

            return (
              <li
                key={step}
                aria-current={current ? "step" : undefined}
                aria-label={orderStatusLabels[step]}
                className="relative z-10 flex min-w-0 flex-col items-center text-center"
              >
                <span
                  aria-hidden
                  className={
                    finishedHere
                      ? "inline-flex size-7 items-center justify-center rounded-full bg-brand-blue text-ink-inverse ring-4 ring-brand-blue-subtle"
                      : done
                        ? "inline-flex size-7 items-center justify-center rounded-full bg-brand-blue text-ink-inverse"
                        : current
                          ? "inline-flex size-7 items-center justify-center rounded-full bg-brand-blue text-[0.75rem] font-bold text-ink-inverse ring-4 ring-brand-blue-subtle"
                          : "inline-flex size-7 items-center justify-center rounded-full border border-border-hairline bg-surface-card text-[0.75rem] font-bold text-ink-muted"
                  }
                >
                  {done || finishedHere ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  aria-hidden
                  className={
                    current
                      ? "mt-2.5 text-[0.8125rem] leading-tight font-semibold text-ink-primary"
                      : done
                        ? "mt-2.5 text-[0.8125rem] leading-tight font-medium text-ink-secondary"
                        : "mt-2.5 text-[0.8125rem] leading-tight font-medium text-ink-muted"
                  }
                >
                  <span className="min-[720px]:hidden">{stepLabels[step]}</span>
                  <span className="hidden min-[720px]:inline">
                    {orderStatusLabels[step]}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-sm font-semibold text-[#9b1c1c]">
          {orderStatusLabels[status]}
        </p>
      )}

      {forward || back || canCancel ? (
        <form onSubmit={handleSubmit} className="mt-6 border-t border-border-hairline pt-5">
          <input type="hidden" name="id" value={orderId} />

          {confirmingCancel ? (
            <div className="flex flex-col gap-3 rounded-input bg-[#fff1f1] px-4 py-3 min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between">
              <p className="text-sm leading-snug text-[#9b1c1c]">
                <span className="font-semibold">Cancelar este pedido?</span> O
                estoque dos itens volta e não dá para desfazer.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirmingCancel(false)}
                  className={secondaryButtonClass}
                >
                  Manter pedido
                </button>
                <button
                  type="submit"
                  name="status"
                  value="CANCELLED"
                  disabled={pending}
                  className={dangerButtonClass}
                >
                  {buttonLabel(
                    "CANCELLED",
                    pending,
                    pendingAction,
                    "Cancelar pedido",
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-end min-[720px]:justify-between">
              <div className="flex min-w-0 flex-col items-start gap-3">
                <p className="text-sm leading-snug text-ink-secondary">
                  {situation[status]}
                </p>
                {status === "SHIPPED" && trackingCode ? (
                  <p className="text-[0.8125rem] text-ink-secondary">
                    Rastreio:{" "}
                    <strong className="font-semibold break-all text-ink-primary">
                      {trackingCode}
                    </strong>
                  </p>
                ) : null}
                {forward === "SHIPPED" ? (
                  <label className="block w-full max-w-xs">
                    <span className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary">
                      Código de rastreio{" "}
                      <span className="font-normal text-ink-muted">
                        (opcional)
                      </span>
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
                {canCancel ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setConfirmingCancel(true)}
                    className={cancelButtonClass}
                  >
                    Cancelar pedido
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {back ? (
                  <button
                    type="submit"
                    name="status"
                    value={back}
                    disabled={pending}
                    className={secondaryButtonClass}
                  >
                    {buttonLabel(back, pending, pendingAction, backLabels[back])}
                  </button>
                ) : null}
                {forward ? (
                  <button
                    type="submit"
                    name="status"
                    value={forward}
                    disabled={pending}
                    className={primaryButtonClass}
                  >
                    {buttonLabel(
                      forward,
                      pending,
                      pendingAction,
                      forwardLabels[forward],
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </form>
      ) : (
        <p className="mt-4 text-sm leading-snug text-ink-secondary">
          {situation[status]}
        </p>
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
