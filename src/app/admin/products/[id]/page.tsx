import { getAdminCategories, getAdminProduct } from "@/lib/admin-products";
import { getSession } from "@/lib/session";
import { ProductEditor } from "@/views/AdminProductsView/components/ProductEditor";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Editar produto — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

interface IEditProductPageProps {
  params: Promise<{ id: string }>;
}

async function EditProduct({ params }: IEditProductPageProps) {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const { id: rawId } = await params;
  if (!/^\d+$/.test(rawId)) notFound();
  const id = Number(rawId);

  const [categories, product] = await Promise.all([
    getAdminCategories(),
    getAdminProduct(id),
  ]);

  if (!product) notFound();

  return (
    <ProductEditor
      categories={categories}
      product={product}
      nextSortOrder={product.sortOrder}
    />
  );
}

export default function EditProductPage({ params }: IEditProductPageProps) {
  return (
    <Suspense
      fallback={
        <p className="text-[0.9375rem] text-ink-muted">Carregando produto…</p>
      }
    >
      <EditProduct params={params} />
    </Suspense>
  );
}
