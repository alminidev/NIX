import { getProducts } from "@/lib/products";
import { HomeView } from "@/views/HomeView";
import { Suspense } from "react";

/**
 * Página Principal da NIX 3D (Single-page catalog).
 * Estrutura 1:1 idêntica ao HTML original (05-build/index.html).
 */

async function Home() {
  const products = await getProducts();

  return <HomeView products={products} />;
}

export default async function HomeWrapper() {
  return (
    <Suspense fallback={"carregando dados..."}>
      <Home />
    </Suspense>
  );
}
