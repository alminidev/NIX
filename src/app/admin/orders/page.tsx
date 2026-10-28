import { parseOrderFilters } from "@/lib/admin-order-filters";
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

interface IOrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function Orders({ searchParams }: IOrdersPageProps) {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const filters = parseOrderFilters(await searchParams);
  const result = await getAdminOrders(filters);

  return <AdminOrdersView result={result} filters={filters} />;
}

export default function OrdersPage({ searchParams }: IOrdersPageProps) {
  return (
    <Suspense
      fallback={
        <p className="text-[0.9375rem] text-ink-muted">Carregando pedidos…</p>
      }
    >
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}
