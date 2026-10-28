import { orderStatusLabels } from "@/lib/order-status";
import type { IDashboardMetrics } from "@/types/dashboard";
import { statusDotClasses } from "@/views/AdminView/components/status-colors";
import Link from "next/link";

interface IOrdersByStatusProps {
  orders: IDashboardMetrics["orders"];
  ordersByStatus: IDashboardMetrics["ordersByStatus"];
}

function formatShare(count: number, total: number) {
  if (total === 0) return "0%";

  const share = (count / total) * 100;
  // Um pedido raro não vira "0%": abaixo de 1% mostra "<1%".
  return count > 0 && share < 1 ? "<1%" : `${Math.round(share)}%`;
}

export default function OrdersByStatus({
  orders,
  ordersByStatus,
}: IOrdersByStatusProps) {
  const summary = ordersByStatus
    .filter((item) => item.count > 0)
    .map((item) => `${orderStatusLabels[item.status]}: ${item.count}`)
    .join(", ");

  return (
    <div className="rounded-card border border-border-hairline bg-surface-card p-5 min-[640px]:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[0.9375rem] font-semibold text-ink-primary">
          Pedidos por status
        </h3>
        <p className="text-[0.8125rem] text-ink-muted">
          {orders === 1 ? "1 pedido" : `${orders} pedidos`}
        </p>
      </div>

      <div
        role="img"
        aria-label={
          orders === 0
            ? "Nenhum pedido ainda"
            : `Distribuição dos pedidos por status. ${summary}`
        }
        className="mt-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-pill bg-surface-canvas-fog"
      >
        {ordersByStatus
          .filter((item) => item.count > 0)
          .map((item) => (
            <span
              key={item.status}
              style={{ flexGrow: item.count }}
              className={`min-w-1.5 basis-0 ${statusDotClasses[item.status]}`}
            />
          ))}
      </div>

      <ul className="mt-5 grid list-none grid-cols-1 gap-2.5 min-[640px]:grid-cols-2 min-[1081px]:grid-cols-4">
        {ordersByStatus.map((item) => (
          <li key={item.status}>
            <Link
              href={`/admin/orders?status=${item.status}`}
              aria-label={`${orderStatusLabels[item.status]}: ${item.count} ${item.count === 1 ? "pedido" : "pedidos"}. Ver na lista`}
              className="flex h-full min-h-14 items-center gap-3 rounded-input border border-border-hairline px-3.5 py-2.5 transition-[border-color,background-color] duration-200 ease-nix hover:border-[rgba(23,107,255,0.35)] hover:bg-brand-blue-subtle focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus"
            >
              <span
                aria-hidden
                className={`size-2.5 shrink-0 rounded-full ${statusDotClasses[item.status]}`}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[0.8125rem] leading-snug font-semibold text-ink-primary">
                  {orderStatusLabels[item.status]}
                </span>
                <span className="block text-xs text-ink-muted tabular-nums">
                  {formatShare(item.count, orders)}
                </span>
              </span>
              <b className="text-xl leading-none font-bold tracking-[-0.02em] text-ink-primary tabular-nums">
                {item.count}
              </b>
            </Link>
          </li>
        ))}
      </ul>

      {orders === 0 ? (
        <p className="mt-4 text-[0.8125rem] text-ink-muted">
          Nenhum pedido ainda. Os pedidos do site aparecem aqui.
        </p>
      ) : null}
    </div>
  );
}
