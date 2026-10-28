import { getAdminOrders } from "@/lib/admin-orders";
import { getSession } from "@/lib/session";
import { AdminOrdersView } from "@/views/AdminOrdersView";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Pedidos — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

async function Orders() {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const orders = await getAdminOrders();
  return <AdminOrdersView orders={orders} />;
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <p className="text-[0.9375rem] text-ink-muted">Carregando pedidos…</p>
      }
    >
      <Orders />
    </Suspense>
  );
}
