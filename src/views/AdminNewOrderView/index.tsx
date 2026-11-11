import type {
  IAdminCustomerOption,
  IAdminOrderProductOption,
} from "@/types/admin-order";
import NewOrderForm from "@/views/AdminNewOrderView/components/NewOrderForm";

interface IAdminNewOrderViewProps {
  customers: IAdminCustomerOption[];
  products: IAdminOrderProductOption[];
}

export function AdminNewOrderView({
  customers,
  products,
}: IAdminNewOrderViewProps) {
  return <NewOrderForm customers={customers} products={products} />;
}
