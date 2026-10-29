import { isInfinitePayCheckoutUrl } from "@/lib/checkout-url";
import type { IAdminOrderDetail } from "@/types/admin-order";
import {
  currencyFormat,
  formatOrderDate,
} from "@/views/AdminOrdersView/components/order-display";
import OrderCard from "@/views/AdminOrderView/components/OrderCard";

interface IOrderPaymentProps {
  payment: IAdminOrderDetail["payment"];
}

const linkClass =
  "inline-flex min-h-10 items-center break-all text-brand-blue-hover transition-colors hover:text-brand-blue";

function methodLabel(method: string | null) {
  if (method === "pix") return "Pix";
  if (method === "credit_card") return "Cartão de crédito";
  return "Não informado";
}

function Money({ value }: { value: number | null }) {
  if (value === null) return "—";
  return currencyFormat.format(value);
}

export default function OrderPayment({ payment }: IOrderPaymentProps) {
  const checkoutUrl =
    payment.checkoutUrl && isInfinitePayCheckoutUrl(payment.checkoutUrl)
      ? payment.checkoutUrl
      : null;
  const hasPayment = payment.paidAt !== null || payment.transactionNsu !== null;

  return (
    <OrderCard id="pagamento-pedido" title="Pagamento">
      {hasPayment ? (
        <dl className="flex flex-col gap-2.5 text-[0.875rem]">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-secondary">Método</dt>
            <dd className="text-right font-semibold text-ink-primary">
              {methodLabel(payment.method)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-secondary">Valor do pedido</dt>
            <dd className="text-right font-semibold text-ink-primary tabular-nums">
              <Money value={payment.amount} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-secondary">Valor pago</dt>
            <dd className="text-right font-semibold text-ink-primary tabular-nums">
              <Money value={payment.paidAmount} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-secondary">Parcelas</dt>
            <dd className="text-right font-semibold text-ink-primary tabular-nums">
              {payment.installments === null ? "—" : `${payment.installments}x`}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-ink-secondary">Transação</dt>
            <dd className="max-w-[180px] text-right font-semibold break-all text-ink-primary">
              {payment.transactionNsu ?? "—"}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-ink-secondary">Fatura</dt>
            <dd className="max-w-[180px] text-right font-semibold break-all text-ink-primary">
              {payment.invoiceSlug ?? "—"}
            </dd>
          </div>
          {payment.paidAt ? (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-secondary">Pago em</dt>
              <dd className="text-right font-semibold text-ink-primary tabular-nums">
                <time dateTime={payment.paidAt.toISOString()}>
                  {formatOrderDate(payment.paidAt)}
                </time>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="text-[0.875rem] text-ink-secondary">
          Ainda sem confirmação de pagamento.
        </p>
      )}

      {payment.receiptUrl || checkoutUrl ? (
        <div className="mt-4 flex flex-col gap-1 border-t border-border-hairline pt-3 text-[0.875rem]">
          {payment.receiptUrl ? (
            <a
              href={payment.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Ver comprovante
            </a>
          ) : null}
          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Link de checkout
            </a>
          ) : null}
        </div>
      ) : null}
    </OrderCard>
  );
}
