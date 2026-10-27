import { quoteShipping } from "@/app/cart/actions";
import { calculateTotal, formatCurrency } from "@/lib/cart-calculation";
import type { ICartItem, ICartSummary, IShippingQuote } from "@/types/cart";
import { ArrowRight, Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { CHECKOUT_FORM_ID } from "./CheckoutForm";

interface IOrderSummaryProps {
  summary: ICartSummary | null;
  items: ICartItem[];
  shipping: IShippingQuote | null;
  onShippingChange: (quote: IShippingQuote | null) => void;
  postalCode: string;
  onPostalCodeChange: (value: string) => void;
  postalCodeError?: string;
  checkoutMessage: string;
  isPlacingOrder: boolean;
  disabled: boolean;
}

/**
 * OrderSummary — Subtotal, frete, total, campo de CEP e botão de checkout.
 */
export default function OrderSummary({
  summary,
  items,
  shipping,
  onShippingChange,
  postalCode,
  onPostalCodeChange,
  postalCodeError,
  checkoutMessage,
  isPlacingOrder,
  disabled,
}: IOrderSummaryProps) {
  const [postalMessage, setPostalMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);
  const [calculating, setCalculating] = useState(false);

  const subtotal = summary?.subtotal ?? 0;
  const shippingPrice = shipping?.status === "quoted" ? shipping.price : null;
  const total = calculateTotal(subtotal, shippingPrice);

  async function handleShipping(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCalculating(true);
    setPostalMessage(null);

    try {
      const result = await quoteShipping(postalCode, items);
      onShippingChange(result.quote);
      setPostalMessage({
        error: result.status === "error",
        text:
          result.message ||
          (result.quote?.deliveryDays
            ? `Entrega em até ${result.quote.deliveryDays} dias úteis.`
            : ""),
      });
    } catch {
      setPostalMessage({
        error: true,
        text: "Não foi possível calcular o frete. Tente novamente.",
      });
    } finally {
      setCalculating(false);
    }
  }

  return (
    <aside
      className="rounded-card border border-border-hairline bg-surface-card p-6 min-[992px]:sticky min-[992px]:top-24"
      aria-label="Resumo do pedido"
    >
      <h2 className="mb-5 text-xl font-semibold tracking-[-0.01em] text-ink-primary">
        Resumo do pedido
      </h2>

      <form onSubmit={handleShipping} className="mb-5" noValidate>
        <label
          htmlFor="postal-code"
          className="mb-2 block text-[0.8125rem] font-semibold text-ink-secondary"
        >
          CEP de entrega
        </label>
        <div className="flex gap-2">
          <input
            id="postal-code"
            name="postalCode"
            value={postalCode}
            onChange={(event) => onPostalCodeChange(event.target.value)}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            maxLength={9}
            disabled={disabled || calculating}
            aria-invalid={
              Boolean(postalCodeError) || (postalMessage?.error ?? false)
            }
            aria-describedby="postal-code-message"
            className="min-h-11 w-full min-w-0 rounded-input border border-border-hairline bg-white px-3 text-[0.9375rem] text-ink-primary placeholder:text-ink-muted disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={disabled || calculating}
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-pill border border-[rgba(23,107,255,0.2)] bg-brand-blue-subtle px-4 text-sm font-semibold text-brand-blue-hover transition-colors hover:bg-brand-blue hover:text-ink-inverse disabled:cursor-not-allowed disabled:opacity-60"
          >
            {calculating ? "Calculando…" : "Calcular"}
          </button>
        </div>
        <p
          id="postal-code-message"
          role="status"
          className={`mt-2 text-xs empty:hidden ${postalCodeError || postalMessage?.error ? "text-[#9b1c1c]" : "text-ink-secondary"}`}
        >
          {postalCodeError ?? postalMessage?.text}
        </p>
      </form>

      <dl className="mb-5 flex flex-col gap-3 border-t border-border-hairline pt-5 text-[0.9375rem]">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-ink-secondary">Subtotal</dt>
          <dd className="font-semibold text-ink-primary">
            {summary ? summary.formattedSubtotal : "—"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-ink-secondary">Frete</dt>
          <dd className="font-semibold text-ink-primary">
            {shippingPrice !== null
              ? formatCurrency(shippingPrice)
              : "A calcular"}
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
        disabled={disabled || isPlacingOrder}
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-pill bg-brand-blue px-6 py-3 text-[0.9375rem] font-semibold text-ink-inverse transition-all duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPlacingOrder ? "Criando pedido…" : "Ir para o checkout"}
        <ArrowRight size={16} aria-hidden />
      </button>

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
