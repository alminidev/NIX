import FreshNavigation from "@/components/FreshNavigation";
import {
  getAdminCategories,
  getNextProductSortOrder,
} from "@/lib/admin-products";
import { getProductionTimeTemplate } from "@/lib/shop-settings";
import { getSession } from "@/lib/session";
import { ProductEditor } from "@/views/AdminProductsView/components/ProductEditor";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Novo produto — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

async function NewProduct() {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const [categories, nextSortOrder, productionTimeTemplate] = await Promise.all([
    getAdminCategories(),
    getNextProductSortOrder(),
    getProductionTimeTemplate(),
  ]);

  return (
    <ProductEditor
      categories={categories}
      nextSortOrder={nextSortOrder}
      productionTimeTemplate={productionTimeTemplate}
    />
  );
}

export default function NewProductPage() {
  return (
    <FreshNavigation>
      <Suspense
        fallback={
          <p className="text-[0.9375rem] text-ink-muted">
            Carregando formulário…
          </p>
        }
      >
        <NewProduct />
      </Suspense>
    </FreshNavigation>
  );
}
