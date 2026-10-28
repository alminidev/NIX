import { adminOrdersLimit } from "@/lib/admin-orders";
import type { IAdminOrder } from "@/types/admin-order";
import OrderList from "@/views/AdminOrdersView/components/OrderList";

interface IAdminOrdersViewProps {
  orders: IAdminOrder[];
}

export function AdminOrdersView({ orders }: IAdminOrdersViewProps) {
  const total = orders.length;

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
            ? "Os pedidos feitos no site aparecem aqui."
            : total >= adminOrdersLimit
              ? `Os ${total} pedidos mais recentes.`
              : `${total} ${total === 1 ? "pedido" : "pedidos"}, do mais recente ao mais antigo.`}
        </p>
      </header>

      <OrderList orders={orders} />
    </div>
  );
}
