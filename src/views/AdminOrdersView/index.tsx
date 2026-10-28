import { hasOrderFilters } from "@/lib/admin-order-filters";
import type { IAdminOrderFilters, IAdminOrderPage } from "@/types/admin-order";
import OrderFilters from "@/views/AdminOrdersView/components/OrderFilters";
import OrderList from "@/views/AdminOrdersView/components/OrderList";
import OrderPagination from "@/views/AdminOrdersView/components/OrderPagination";

interface IAdminOrdersViewProps {
  result: IAdminOrderPage;
  filters: IAdminOrderFilters;
}

export function AdminOrdersView({ result, filters }: IAdminOrdersViewProps) {
  const { total } = result;
  const filtered = hasOrderFilters(filters);

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <header>
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
              : "Os pedidos feitos no site aparecem aqui."
            : `${total} ${total === 1 ? "pedido" : "pedidos"}${filtered ? " com esses filtros" : ""}, do mais recente ao mais antigo.`}
        </p>
      </header>

      <OrderFilters filters={filters} />
      <OrderList orders={result.orders} filtered={filtered} />
      <OrderPagination result={result} filters={filters} />
    </div>
  );
}
