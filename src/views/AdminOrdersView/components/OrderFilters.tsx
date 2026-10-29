import { hasOrderFilters } from "@/lib/admin-order-filters";
import { orderStatuses, orderStatusLabels } from "@/lib/order-status";
import type { IAdminOrderFilters } from "@/types/admin-order";
import { Search } from "lucide-react";
import Link from "next/link";

interface IOrderFiltersProps {
  filters: IAdminOrderFilters;
}

const controlClass =
  "min-h-11 w-full rounded-pill border border-border-hairline bg-surface-card px-4 text-sm text-ink-primary focus:border-brand-blue focus:outline-2 focus:outline-offset-1 focus:outline-border-focus";

const labelClass =
  "mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary";

/**
 * Filtros da lista de pedidos. É um formulário GET: os valores vão para os
 * searchParams da página e a lista é lida de novo no servidor.
 */
export default function OrderFilters({ filters }: IOrderFiltersProps) {
  const key = [
    filters.q,
    filters.status,
    filters.from,
    filters.to,
    filters.review,
  ].join("|");

  return (
    <form
      key={key}
      method="get"
      action="/admin/orders"
      className="grid grid-cols-1 gap-3 min-[720px]:grid-cols-2 min-[1081px]:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] min-[1081px]:items-end"
    >
      <label className="relative block">
        <span className={labelClass}>Buscar</span>
        <Search
          size={16}
          aria-hidden
          className="pointer-events-none absolute bottom-3.5 left-3.5 text-ink-muted"
        />
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          maxLength={100}
          placeholder="Cliente, e-mail ou nº do pedido"
          className={`${controlClass} pl-10`}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Status</span>
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className={controlClass}
        >
          <option value="">Todos</option>
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {orderStatusLabels[status]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelClass}>De</span>
        <input
          type="date"
          name="from"
          defaultValue={filters.from ?? ""}
          className={controlClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Até</span>
        <input
          type="date"
          name="to"
          defaultValue={filters.to ?? ""}
          className={controlClass}
        />
      </label>

      <div className="flex items-center gap-3 min-[720px]:col-span-2 min-[1081px]:col-span-1">
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-secondary">
          <input
            type="checkbox"
            name="review"
            value="1"
            defaultChecked={filters.review}
            className="size-4 accent-brand-blue"
          />
          Em revisão
        </label>
        <button
          type="submit"
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill bg-brand-blue px-5 text-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-blue-hover"
        >
          Filtrar
        </button>
        {hasOrderFilters(filters) ? (
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-brand-blue-hover"
          >
            Limpar
          </Link>
        ) : null}
      </div>
    </form>
  );
}
