import type { IAdminOrderDetail } from "@/types/admin-order";
import { formatOrderDate } from "@/views/AdminOrdersView/components/order-display";
import OrderCard from "@/views/AdminOrderView/components/OrderCard";

interface IOrderDatesProps {
  order: IAdminOrderDetail;
}

function DateRow({ label, date }: { label: string; date: Date }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-secondary">{label}</dt>
      <dd className="text-right font-semibold text-ink-primary tabular-nums">
        <time dateTime={date.toISOString()}>{formatOrderDate(date)}</time>
      </dd>
    </div>
  );
}

export default function OrderDates({ order }: IOrderDatesProps) {
  return (
    <OrderCard id="datas-pedido" title="Datas">
      <dl className="flex flex-col gap-2.5 text-[0.875rem]">
        <DateRow label="Criado em" date={order.createdAt} />
        <DateRow label="Última atualização" date={order.updatedAt} />
        {order.status === "AWAITING_PAYMENT" && order.expiresAt ? (
          <DateRow label="Pagar até" date={order.expiresAt} />
        ) : null}
        {order.status === "EXPIRED" && order.expiresAt ? (
          <DateRow label="Expirou em" date={order.expiresAt} />
        ) : null}
      </dl>
    </OrderCard>
  );
}
