import { getAdminOrder } from "@/lib/admin-orders";
import { getSession } from "@/lib/session";
import { AdminOrderView } from "@/views/AdminOrderView";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Pedido — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

interface IOrderPageProps {
  params: Promise<{ id: string }>;
}

async function Order({ params }: IOrderPageProps) {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const { id: rawId } = await params;
  if (!/^\d{1,10}$/.test(rawId)) notFound();

  const id = Number(rawId);
  if (id < 1 || id > 2_147_483_647) notFound();

  const order = await getAdminOrder(id);

  if (!order) notFound();

  return <AdminOrderView order={order} />;
}

export default function OrderPage({ params }: IOrderPageProps) {
  return (
    <Suspense
      fallback={
        <p className="text-[0.9375rem] text-ink-muted">Carregando pedido…</p>
      }
    >
      <Order params={params} />
    </Suspense>
  );
}
