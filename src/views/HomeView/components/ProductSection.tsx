import ProductCatalog from "@/views/HomeView/components/ProductCatalog";
import ProductGridFallback from "@/views/HomeView/components/ProductGridFallback";
import { Suspense } from "react";

/**
 * A seção entra no HTML inicial. Só a grade, que depende do banco,
 * fica atrás do Suspense e pode chegar depois.
 */
export default function ProductSection() {
  return (
    <section id="produtos" className="section-products">
      <div className="container">
        <header className="section-header">
          <span className="kicker">Catálogo Oficial</span>
          <h2>Linha NIX Dry Box &amp; Setup Lab</h2>
          <p>
            Engenharia de precisão para armazenar e imprimir direto da estufa.
            Escolha a capacidade sob medida para o seu volume de produção.
          </p>
        </header>

        <Suspense fallback={<ProductGridFallback />}>
          <ProductCatalog />
        </Suspense>
      </div>
    </section>
  );
}
