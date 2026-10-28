import type { IAdminOrderDetail } from "@/types/admin-order";
import { formatPhone } from "@/views/AdminOrdersView/components/order-display";
import OrderCard from "@/views/AdminOrderView/components/OrderCard";

interface IOrderCustomerProps {
  customer: IAdminOrderDetail["customer"];
}

const linkClass =
  "inline-flex min-h-10 items-center break-all text-brand-blue-hover transition-colors hover:text-brand-blue";

export default function OrderCustomer({ customer }: IOrderCustomerProps) {
  return (
    <OrderCard id="cliente-pedido" title="Cliente">
      <p className="text-[0.9375rem] font-semibold text-ink-primary">
        {customer.name}
      </p>
      <dl className="mt-3 flex flex-col gap-2.5 text-[0.9375rem]">
        <div>
          <dt className="text-xs font-semibold tracking-[0.04em] text-ink-muted uppercase">
            E-mail
          </dt>
          <dd>
            <a href={`mailto:${customer.email}`} className={linkClass}>
              {customer.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-[0.04em] text-ink-muted uppercase">
            Telefone
          </dt>
          <dd>
            <a href={`tel:+55${customer.phone}`} className={linkClass}>
              {formatPhone(customer.phone)}
            </a>
          </dd>
        </div>
      </dl>
    </OrderCard>
  );
}
