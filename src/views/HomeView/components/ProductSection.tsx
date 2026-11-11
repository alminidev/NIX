import ProductCatalog from "@/views/HomeView/components/ProductCatalog";
import { catalogIntro } from "@/views/HomeView/copy";
import ProductGridFallback from "@/views/HomeView/components/ProductGridFallback";
import { Suspense } from "react";

/**
 * A seção entra no HTML inicial. Só a grade, que depende do banco,
 * fica atrás do Suspense e pode chegar depois.
 */
export default function ProductSection() {
  return (
    <section
      id="produtos"
      className="bg-surface-canvas-fog py-16 min-[640px]:py-20 min-[992px]:py-[100px]"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[640px]:px-6">
        <header className="mx-auto mb-14 max-w-[680px] text-center">
          <span className="mb-3 inline-block text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
            {catalogIntro.kicker}
          </span>
          <h2 className="text-[clamp(1.75rem,3vw+0.5rem,2.5rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
            {catalogIntro.title}
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-normal text-ink-secondary">
            {catalogIntro.description}
          </p>
        </header>

        <Suspense fallback={<ProductGridFallback />}>
          <ProductCatalog />
        </Suspense>
      </div>
    </section>
  );
}
