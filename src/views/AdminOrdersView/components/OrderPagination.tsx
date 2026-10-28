import { buildOrdersHref } from "@/lib/admin-order-filters";
import type { IAdminOrderFilters, IAdminOrderPage } from "@/types/admin-order";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface IOrderPaginationProps {
  result: IAdminOrderPage;
  filters: IAdminOrderFilters;
}

const linkClass =
  "inline-flex min-h-11 items-center gap-1 rounded-pill border border-border-hairline bg-surface-card px-4 text-sm font-semibold text-ink-primary transition-colors hover:border-brand-blue";

const disabledClass =
  "inline-flex min-h-11 items-center gap-1 rounded-pill border border-border-hairline bg-surface-card px-4 text-sm font-semibold text-ink-muted opacity-60";

export default function OrderPagination({
  result,
  filters,
}: IOrderPaginationProps) {
  const { page, pageCount } = result;

  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Paginação dos pedidos"
      className="flex items-center justify-between gap-4"
    >
      {page > 1 ? (
        <Link
          href={buildOrdersHref(filters, page - 1)}
          rel="prev"
          className={linkClass}
        >
          <ChevronLeft size={16} aria-hidden />
          Anterior
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          <ChevronLeft size={16} aria-hidden />
          Anterior
        </span>
      )}

      <p className="text-[0.8125rem] text-ink-muted" aria-live="polite">
        Página {page} de {pageCount}
      </p>

      {page < pageCount ? (
        <Link
          href={buildOrdersHref(filters, page + 1)}
          rel="next"
          className={linkClass}
        >
          Próxima
          <ChevronRight size={16} aria-hidden />
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          Próxima
          <ChevronRight size={16} aria-hidden />
        </span>
      )}
    </nav>
  );
}
