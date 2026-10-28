import type { IAdminOrderDetail } from "@/types/admin-order";
import { currencyFormat } from "@/views/AdminOrdersView/components/order-display";
import OrderCard from "@/views/AdminOrderView/components/OrderCard";
import Link from "next/link";

interface IOrderItemsProps {
  order: IAdminOrderDetail;
}

export default function OrderItems({ order }: IOrderItemsProps) {
  return (
    <OrderCard
      id="itens-pedido"
      title={`Itens (${order.itemCount} ${order.itemCount === 1 ? "unidade" : "unidades"})`}
    >
      <ul className="flex list-none flex-col">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-4 border-t border-border-hairline py-4 first:border-t-0 first:pt-0"
          >
            <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-input border border-black/4 bg-white">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt=""
                  width={64}
                  height={64}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-[0.6875rem] text-ink-muted">
                  Sem foto
                </span>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2 min-[640px]:flex-row min-[640px]:items-start min-[640px]:justify-between min-[640px]:gap-4">
              <div className="min-w-0">
                <Link
                  href={`/admin/products/${item.productId}`}
                  className="inline-block py-0.5 text-[0.9375rem] leading-snug font-semibold text-ink-primary transition-colors hover:text-brand-blue"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-[0.8125rem] text-ink-muted">
                  {item.sku}
                </p>
                <p className="mt-1 text-[0.8125rem] text-ink-secondary">
                  {item.quantity} × {currencyFormat.format(item.unitPrice)}
                </p>
              </div>
              <p className="text-base font-bold tracking-[-0.02em] whitespace-nowrap text-ink-primary tabular-nums min-[640px]:text-right">
                {currencyFormat.format(item.lineTotal)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-2 flex flex-col gap-2.5 border-t border-border-hairline pt-4 text-[0.9375rem]">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink-secondary">Subtotal</dt>
          <dd className="font-semibold text-ink-primary tabular-nums">
            {currencyFormat.format(order.subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink-secondary">Frete</dt>
          <dd className="font-semibold text-ink-primary tabular-nums">
            {order.shipping === null
              ? "Não cotado"
              : currencyFormat.format(order.shipping)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border-hairline pt-3">
          <dt className="font-semibold text-ink-primary">Total</dt>
          <dd className="text-xl font-bold tracking-[-0.02em] text-ink-primary tabular-nums">
            {currencyFormat.format(order.total)}
          </dd>
        </div>
      </dl>
    </OrderCard>
  );
}
