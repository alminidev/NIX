import { orderStatusLabels } from "@/lib/order-status";
import type { IAdminOrder } from "@/types/admin-order";
import {
  currencyFormat,
  formatOrderDate,
  statusBadgeClasses,
} from "@/views/AdminOrdersView/components/order-display";

interface IOrderListProps {
  orders: IAdminOrder[];
  /** Há busca ou filtro aplicado (muda a mensagem da lista vazia) */
  filtered: boolean;
}

export default function OrderList({ orders, filtered }: IOrderListProps) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby="lista-pedidos">
      <h2 id="lista-pedidos" className="sr-only">
        Pedidos mais recentes
      </h2>

      <div className="overflow-hidden rounded-card border border-border-hairline bg-surface-card">
        {orders.length === 0 ? (
          <p className="px-6 py-12 text-center text-[0.9375rem] text-ink-muted">
            {filtered
              ? "Nenhum pedido encontrado com esses filtros."
              : "Nenhum pedido ainda."}
          </p>
        ) : (
          <ul className="flex list-none flex-col">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-3 border-t border-border-hairline px-4 py-4 first:border-t-0 min-[1081px]:flex-row min-[1081px]:items-center min-[1081px]:gap-4 min-[1081px]:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-[0.9375rem] leading-snug font-semibold text-ink-primary">
                      Pedido nº {order.id}
                    </strong>
                    <span className={statusBadgeClasses[order.status]}>
                      {orderStatusLabels[order.status]}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[0.8125rem] text-ink-muted">
                    {order.customerName} · {order.customerEmail}
                  </p>
                </div>

                <p className="text-[0.8125rem] text-ink-muted min-[1081px]:w-36 min-[1081px]:text-right">
                  <time dateTime={order.createdAt.toISOString()}>
                    {formatOrderDate(order.createdAt)}
                  </time>
                </p>

                <p className="min-[1081px]:w-28 min-[1081px]:text-right">
                  <span className="block text-lg leading-none font-bold tracking-[-0.02em] text-ink-primary tabular-nums">
                    {currencyFormat.format(order.total)}
                  </span>
                  <span className="mt-1 block text-[0.6875rem] font-semibold tracking-[0.04em] text-ink-muted uppercase">
                    {order.itemCount} {order.itemCount === 1 ? "item" : "itens"}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
