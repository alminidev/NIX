"use client";

import { CART_URL } from "@/data/produtos";
import type { IProduct } from "@/types/product";
import { useState } from "react";
import ProductCard from "../../../components/ProductCard";
import ProductLightbox from "../../../components/ProductLightbox";

interface IProductGridProps {
  products: IProduct[];
}

/**
 * ProductGrid — Vitrine de produtos com separação editorial por categoria.
 *
 * Grupos editoriais:
 *   - Grupo 1 (grid 3 colunas): SKUs que começam com NIX-DB (Armários Dry Box)
 *   - Grupo 2 (grid 2 colunas, centrado): SKUs que começam com NIX-STATION (Dry Box Station)
 *
 * Integrado com ProductLightbox para ampliação acessível de fotos.
 */
export default function ProductGrid({ products }: IProductGridProps) {
  const cartUrl = CART_URL;
  const [activeLightboxProduct, setActiveLightboxProduct] =
    useState<IProduct | null>(null);

  const dryBoxCabinets = products.filter((product) =>
    product.sku.startsWith("NIX-DB"),
  );
  const setupLabStations = products.filter(
    (product) =>
      product.sku.startsWith("NIX-STATION") ||
      product.category.includes("Station"),
  );

  return (
    <>
      <div id="products-grid" className="w-full">
        <div className="mb-6">
          <div className="mb-8">
            <span className="mb-1.5 inline-block text-xs font-bold tracking-[0.06em] text-brand-blue-hover uppercase">
              Armazenamento Ativo
            </span>
            <h3 className="mb-1.5 text-[clamp(1.25rem,2vw+0.5rem,1.625rem)] leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
              Armários de Filamentos Dry Box
            </h3>
            <p className="max-w-[620px] text-[0.9375rem] text-ink-secondary">
              Estufas estanques com desumidificação ativa permanente para 12, 24
              ou 48 filamentos.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[992px]:grid-cols-3 min-[992px]:gap-7">
            {dryBoxCabinets.map((product) => (
              <ProductCard
                key={product.sku}
                product={product}
                cartUrl={cartUrl}
                onOpenLightbox={(item) => setActiveLightboxProduct(item)}
              />
            ))}
          </div>
        </div>

        <div className="my-14 h-px w-full bg-border-hairline" aria-hidden="true" />

        <div className="mb-6">
          <div className="mb-8">
            <span className="mb-1.5 inline-block text-xs font-bold tracking-[0.06em] text-brand-blue-hover uppercase">
              Estações Integradas
            </span>
            <h3 className="mb-1.5 text-[clamp(1.25rem,2vw+0.5rem,1.625rem)] leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
              Dry Box Station Combos
            </h3>
            <p className="max-w-[620px] text-[0.9375rem] text-ink-secondary">
              Soluções completas com bancada integrada antivibração e
              armazenamento climatizado para Bambu Lab.
            </p>
          </div>
          <div className="mx-auto grid w-full max-w-full grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[992px]:max-w-[820px] min-[992px]:gap-7">
            {setupLabStations.map((product) => (
              <ProductCard
                key={product.sku}
                product={product}
                cartUrl={cartUrl}
                onOpenLightbox={(item) => setActiveLightboxProduct(item)}
              />
            ))}
          </div>
        </div>

        <div
          className="mt-10 rounded-card border border-border-hairline bg-white px-5 py-[14px] text-center"
          role="note"
        >
          <p className="text-[0.8125rem] text-ink-secondary">
            ⚠️ <strong>Observação Importante:</strong> Imagens ilustrativas. A
            impressora e os filamentos não acompanham o produto.
          </p>
        </div>
      </div>

      <ProductLightbox
        product={activeLightboxProduct}
        isOpen={activeLightboxProduct !== null}
        onClose={() => setActiveLightboxProduct(null)}
      />
    </>
  );
}
