import type { IDashboardMetrics } from "@/types/dashboard";
import { CircleAlert, CircleCheck, Clock, PackageX } from "lucide-react";
import Link from "next/link";

interface IAttentionProps {
  awaitingPayment: IDashboardMetrics["awaitingPayment"];
  paymentReviews: IDashboardMetrics["paymentReviews"];
  outOfStock: IDashboardMetrics["outOfStock"];
}

/** Quantos produtos zerados aparecem na lista; o resto vai no "e mais N". */
const outOfStockPreview = 3;

const actionClass =
  "inline-flex min-h-10 items-center text-sm font-semibold transition-colors";

export default function Attention({
  awaitingPayment,
  paymentReviews,
  outOfStock,
}: IAttentionProps) {
  const nothingToDo =
    awaitingPayment === 0 && paymentReviews === 0 && outOfStock.length === 0;
  const hidden = outOfStock.length - outOfStockPreview;

  return (
    <section
      className="flex flex-col gap-4"
      aria-labelledby="precisa-de-atencao"
    >
      <h2
        id="precisa-de-atencao"
        className="text-lg leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary"
      >
        Precisa de atenção
      </h2>

      {nothingToDo ? (
        <p className="flex items-center gap-3 rounded-card border border-border-hairline bg-surface-card p-5 text-[0.9375rem] text-ink-secondary">
          <CircleCheck
            size={20}
            aria-hidden
            className="shrink-0 text-brand-blue"
          />
          Tudo em dia: nenhum pedido aguardando pagamento, nenhum pagamento em
          revisão e nenhum produto zerado.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[861px]:grid-cols-2">
          {awaitingPayment > 0 ? (
            <article className="flex flex-col gap-3 rounded-card border border-border-hairline bg-surface-card p-5 min-[640px]:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-pill border border-[rgba(23,107,255,0.15)] bg-brand-blue-subtle text-brand-blue">
                  <Clock size={20} aria-hidden />
                </span>
                <div>
                  <p className="text-[0.9375rem] font-semibold text-ink-primary">
                    {awaitingPayment === 1
                      ? "1 pedido aguardando pagamento"
                      : `${awaitingPayment} pedidos aguardando pagamento`}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-ink-muted">
                    Seguram o estoque até pagar ou expirar.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/orders?status=AWAITING_PAYMENT"
                className={`${actionClass} self-start text-brand-blue-hover hover:text-brand-blue`}
              >
                Ver pedidos
              </Link>
            </article>
          ) : null}

          {paymentReviews > 0 ? (
            <article className="flex flex-col gap-3 rounded-card border border-[#f0ddb0] bg-[#fff8eb] p-5 min-[640px]:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-pill border border-[#f0ddb0] bg-white text-[#7a5b12]">
                  <CircleAlert size={20} aria-hidden />
                </span>
                <div>
                  <p className="text-[0.9375rem] font-semibold text-[#7a5b12]">
                    {paymentReviews === 1
                      ? "1 pagamento para revisar"
                      : `${paymentReviews} pagamentos para revisar`}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-[#7a5b12]">
                    O dinheiro entrou, mas o pedido não foi confirmado
                    automaticamente.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/orders?review=1"
                className={`${actionClass} self-start text-[#7a5b12] hover:text-[#5c4510]`}
              >
                Ver pedidos
              </Link>
            </article>
          ) : null}

          {outOfStock.length > 0 ? (
            <article className="flex flex-col gap-3 rounded-card border border-[#f0c7c7] bg-[#fff1f1] p-5 min-[640px]:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-pill border border-[#f0c7c7] bg-white text-[#9b1c1c]">
                  <PackageX size={20} aria-hidden />
                </span>
                <div>
                  <p className="text-[0.9375rem] font-semibold text-[#9b1c1c]">
                    {outOfStock.length === 1
                      ? "1 produto sem estoque"
                      : `${outOfStock.length} produtos sem estoque`}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-[#9b1c1c]">
                    Não aparecem para compra até repor.
                  </p>
                </div>
              </div>
              <ul className="flex list-none flex-col">
                {outOfStock.slice(0, outOfStockPreview).map((product) => (
                  <li
                    key={product.id}
                    className="border-t border-[#f0c7c7] py-2 first:border-t-0"
                  >
                    <strong className="block text-[0.875rem] font-semibold text-ink-primary">
                      {product.name}
                    </strong>
                    <span className="block text-xs text-[#9b1c1c]">
                      {product.sku} · {product.category}
                    </span>
                  </li>
                ))}
                {hidden > 0 ? (
                  <li className="border-t border-[#f0c7c7] pt-2 text-[0.8125rem] text-[#9b1c1c]">
                    e mais {hidden}
                  </li>
                ) : null}
              </ul>
              <Link
                href="/admin/stock"
                className={`${actionClass} self-start text-[#9b1c1c] hover:text-[#7f1616]`}
              >
                Ajustar estoque
              </Link>
            </article>
          ) : null}
        </div>
      )}
    </section>
  );
}
