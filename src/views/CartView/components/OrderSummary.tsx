import { calculateTotal, formatCurrency } from "@/lib/cart-calculation";
import { formatDeliveryDays } from "@/lib/shipping-display";
import type { ICartSummary, IShippingQuote } from "@/types/cart";
import { ArrowRight, Lock } from "lucide-react";
import { CHECKOUT_FORM_ID } from "./CheckoutForm";

interface IOrderSummaryProps {
  summary: ICartSummary | null;
  shipping: IShippingQuote | null;
  selectedServiceId: number | null;
  /** Endereço já preenchido pela consulta do CEP */
  addressReady: boolean;
  checkoutMessage: string;
  isPlacingOrder: boolean;
  disabled: boolean;
}

/**
 * OrderSummary — Subtotal, frete, total e botão de checkout.
 */
export default function OrderSummary({
  summary,
  shipping,
  selectedServiceId,
  addressReady,
  checkoutMessage,
  isPlacingOrder,
  disabled,
}: IOrderSummaryProps) {
  const subtotal = summary?.subtotal ?? 0;
  const selected =
    shipping?.status === "quoted"
      ? (shipping.options.find(
          (option) => option.serviceId === selectedServiceId,
        ) ?? shipping.options[0])
      : undefined;
  const shippingPrice = selected?.price ?? null;
  const total = calculateTotal(subtotal, shippingPrice);
  const quoted = shippingPrice !== null;

  return (
    <aside
      className="rounded-card border border-border-hairline bg-surface-card p-6 min-[992px]:sticky min-[992px]:top-24"
      aria-label="Resumo do pedido"
    >
      <h2 className="mb-5 text-xl font-semibold tracking-[-0.01em] text-ink-primary">
        Resumo do pedido
      </h2>

      <dl className="mb-5 flex flex-col gap-3 border-t border-border-hairline pt-5 text-[0.9375rem]">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-ink-secondary">Subtotal</dt>
          <dd className="font-semibold text-ink-primary">
            {summary ? summary.formattedSubtotal : "—"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-ink-secondary">Frete</dt>
          <dd className="text-right font-semibold text-ink-primary">
            {shippingPrice !== null ? formatCurrency(shippingPrice) : "A calcular"}
            {selected ? (
              <span className="mt-0.5 block text-xs font-normal text-ink-secondary">
                {formatDeliveryDays(selected.deliveryDays)}
              </span>
            ) : null}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-2 border-t border-border-hairline pt-3">
          <dt className="font-semibold text-ink-primary">Total</dt>
          <dd className="text-[1.375rem] font-bold tracking-[-0.02em] text-ink-primary">
            {summary ? formatCurrency(total) : "—"}
          </dd>
        </div>
      </dl>

      <button
        type="submit"
        form={CHECKOUT_FORM_ID}
        disabled={disabled || !addressReady || !quoted || isPlacingOrder}
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-pill bg-brand-blue px-6 py-3 text-[0.9375rem] font-semibold text-ink-inverse transition-all duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPlacingOrder ? "Criando pedido…" : "Ir para o checkout"}
        <ArrowRight size={16} aria-hidden />
      </button>

      <p className="mt-3 text-center text-xs text-ink-secondary empty:hidden">
        {disabled || isPlacingOrder
          ? ""
          : !addressReady
            ? "Informe o CEP e clique em Calcular para continuar."
            : quoted
              ? ""
              : "Calcule o frete para continuar."}
      </p>

      <p
        role="alert"
        className="mt-3 text-center text-xs text-[#9b1c1c] empty:hidden"
      >
        {checkoutMessage}
      </p>

      <div
        className="mt-2.5 flex items-center justify-center gap-1.5 text-[0.6875rem] font-medium text-ink-muted"
        aria-hidden="true"
      >
        <Lock size={12} className="text-brand-blue" aria-hidden />
        <span>Ambiente Seguro InfinitePay</span>
      </div>
    </aside>
  );
}
