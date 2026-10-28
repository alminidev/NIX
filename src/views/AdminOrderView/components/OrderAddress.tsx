import { maskPostalCode } from "@/lib/cart-input";
import type { IAdminOrderDetail } from "@/types/admin-order";
import OrderCard from "@/views/AdminOrderView/components/OrderCard";

interface IOrderAddressProps {
  address: IAdminOrderDetail["address"];
}

export default function OrderAddress({ address }: IOrderAddressProps) {
  return (
    <OrderCard id="entrega-pedido" title="Entrega">
      <address className="text-[0.9375rem] leading-normal text-ink-primary not-italic">
        <p>
          {address.street}, {address.number}
          {address.complement ? ` — ${address.complement}` : ""}
        </p>
        <p>{address.neighborhood}</p>
        <p>
          {address.city}/{address.state}
        </p>
        <p className="mt-1 text-ink-secondary">
          CEP {maskPostalCode(address.postalCode)}
        </p>
      </address>
    </OrderCard>
  );
}
