import type { IAdminOrderDetail } from "@/types/admin-order";
import { orderStatusLabels } from "@/lib/order-status";
import {
  formatOrderDate,
  orderSourceLabels,
  statusBadgeClasses,
} from "@/views/AdminOrdersView/components/order-display";
import OrderAddress from "@/views/AdminOrderView/components/OrderAddress";
import OrderCustomer from "@/views/AdminOrderView/components/OrderCustomer";
import OrderDates from "@/views/AdminOrderView/components/OrderDates";
import OrderItems from "@/views/AdminOrderView/components/OrderItems";
import OrderPayment from "@/views/AdminOrderView/components/OrderPayment";
import OrderStatusForm from "@/views/AdminOrderView/components/OrderStatusForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface IAdminOrderViewProps {
  order: IAdminOrderDetail;
}

export function AdminOrderView({ order }: IAdminOrderViewProps) {
  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <header>
        <Link
          href="/admin/orders"
          className="mb-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-ink-secondary transition-colors hover:text-brand-blue"
        >
          <ArrowLeft size={16} aria-hidden />
          Pedidos
        </Link>
        <p className="mb-2 text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
          Vendas
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
            Pedido nº {order.id}
          </h1>
          <span className={statusBadgeClasses[order.status]}>
            {orderStatusLabels[order.status]}
          </span>
        </div>
        <p className="mt-2 max-w-140 text-[0.9375rem] text-ink-secondary">
          Feito em{" "}
          <time dateTime={order.createdAt.toISOString()}>
            {formatOrderDate(order.createdAt)}
          </time>{" "}
          · {orderSourceLabels[order.source]}
        </p>
      </header>

      {order.payment.review ? (
        <p
          className="rounded-card border border-[#f0ddb0] bg-[#fff8eb] px-5 py-4 text-[0.9375rem] text-[#7a5b12]"
          role="status"
        >
          Este pagamento precisa de revisão manual.
          {order.payment.reviewReason ? (
            <span className="mt-1 block">{order.payment.reviewReason}</span>
          ) : null}
        </p>
      ) : null}

      <OrderStatusForm
        orderId={order.id}
        status={order.status}
        trackingCode={order.trackingCode}
      />

      <div className="grid grid-cols-1 items-start gap-6 min-[1081px]:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <OrderItems order={order} />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <OrderCustomer customer={order.customer} />
          <OrderPayment payment={order.payment} />
          <OrderAddress address={order.address} />
          <OrderDates order={order} />
        </div>
      </div>
    </div>
  );
}
