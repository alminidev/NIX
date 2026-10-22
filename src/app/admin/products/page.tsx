import {
  getAdminProducts,
} from "@/lib/admin-products";
import { getSession } from "@/lib/session";
import { AdminProductsView } from "@/views/AdminProductsView";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Produtos — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

async function Products() {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const products = await getAdminProducts();
  return <AdminProductsView products={products} />;
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <p className="text-[0.9375rem] text-ink-muted">Carregando produtos…</p>
      }
    >
      <Products />
    </Suspense>
  );
}
