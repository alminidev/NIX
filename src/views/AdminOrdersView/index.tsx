import { hasOrderFilters } from "@/lib/admin-order-filters";
import type { IAdminOrderFilters, IAdminOrderPage } from "@/types/admin-order";
import OrderFilters from "@/views/AdminOrdersView/components/OrderFilters";
import OrderList from "@/views/AdminOrdersView/components/OrderList";
import OrderPagination from "@/views/AdminOrdersView/components/OrderPagination";
import { Plus } from "lucide-react";
import Link from "next/link";

interface IAdminOrdersViewProps {
  result: IAdminOrderPage;
  filters: IAdminOrderFilters;
}

export function AdminOrdersView({ result, filters }: IAdminOrdersViewProps) {
  const { total } = result;
  const filtered = hasOrderFilters(filters);

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <header className="flex flex-col gap-4 min-[1081px]:flex-row min-[1081px]:items-end min-[1081px]:justify-between">
        <div>
          <p className="mb-2 inline-block text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
            Vendas
          </p>
          <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
            Pedidos
          </h1>
          <p className="mt-2 max-w-140 text-[0.9375rem] text-ink-secondary">
            {total === 0
              ? filtered
                ? "Nenhum pedido com esses filtros."
                : "Os pedidos aparecem aqui."
              : `${total} ${total === 1 ? "pedido" : "pedidos"}${filtered ? " com esses filtros" : ""}, do mais recente ao mais antigo.`}
          </p>
        </div>
        <Link
          href="/admin/orders/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-pill bg-brand-blue px-5 text-sm font-semibold text-ink-inverse transition-[background-color] duration-200 ease-nix hover:bg-brand-blue-hover"
        >
          <Plus size={16} aria-hidden />
          Novo pedido
        </Link>
      </header>

      <OrderFilters filters={filters} />
      <OrderList orders={result.orders} filtered={filtered} />
      <OrderPagination result={result} filters={filters} />
    </div>
  );
}
