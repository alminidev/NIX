import { getStockProducts } from "@/lib/admin-stock";
import { getSession } from "@/lib/session";
import { AdminStockView } from "@/views/AdminStockView";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Estoque — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

async function Stock() {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const products = await getStockProducts();
  return <AdminStockView products={products} />;
}

export default function StockPage() {
  return (
    <Suspense
      fallback={
        <p className="text-[0.9375rem] text-ink-muted">Carregando estoque…</p>
      }
    >
      <Stock />
    </Suspense>
  );
}
