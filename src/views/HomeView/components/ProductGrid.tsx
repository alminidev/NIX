"use client";

import { CART_URL } from "@/data/produtos";
import type { IProduct } from "@/types/product";
import { useState } from "react";
import ProductCard from "../../../components/ProductCard";
import ProductLightbox from "../../../components/ProductLightbox";

interface IProductGridProps {
  products: IProduct[];
}

const sectionCopy: Record<
  string,
  { eyebrow: string; title: string; description: string; centered: boolean }
> = {
  armarios: {
    eyebrow: "Armazenamento Ativo",
    title: "Armários de Filamentos Dry Box",
    description:
      "Estufas estanques com desumidificação ativa permanente para 12, 24 ou 48 filamentos.",
    centered: false,
  },
  stations: {
    eyebrow: "Estações Integradas",
    title: "Dry Box Station Combos",
    description:
      "Soluções completas com bancada integrada antivibração e armazenamento climatizado para Bambu Lab.",
    centered: true,
  },
};

function groupByCategory(products: IProduct[]) {
  const groups = new Map<
    string,
    { slug: string; name: string; sortOrder: number; products: IProduct[] }
  >();

  for (const product of products) {
    const current = groups.get(product.categorySlug);
    if (current) {
      current.products.push(product);
      continue;
    }
    groups.set(product.categorySlug, {
      slug: product.categorySlug,
      name: product.category,
      sortOrder: product.categorySortOrder,
      products: [product],
    });
  }

  return [...groups.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "pt-BR"),
  );
}

/**
 * ProductGrid — Vitrine de produtos agrupada pela categoria do catálogo.
 * Todo produto ativo entra na seção da própria categoria, independente do SKU.
 */
export default function ProductGrid({ products }: IProductGridProps) {
  const cartUrl = CART_URL;
  const [activeLightboxProduct, setActiveLightboxProduct] =
    useState<IProduct | null>(null);
  const sections = groupByCategory(products);

  return (
    <>
      <div id="products-grid" className="w-full">
        {sections.map((section, index) => {
          const copy = sectionCopy[section.slug] ?? {
            eyebrow: "Catálogo",
            title: section.name,
            description: "",
            centered: false,
          };

          return (
            <div key={section.slug}>
              {index > 0 ? (
                <div
                  className="my-14 h-px w-full bg-border-hairline"
                  aria-hidden="true"
                />
              ) : null}
              <div className="mb-6">
                <div className="mb-8">
                  <span className="mb-1.5 inline-block text-xs font-bold tracking-[0.06em] text-brand-blue-hover uppercase">
                    {copy.eyebrow}
                  </span>
                  <h3 className="mb-1.5 text-[clamp(1.25rem,2vw+0.5rem,1.625rem)] leading-tight font-semibold tracking-[-0.01em] text-ink-primary">
                    {copy.title}
                  </h3>
                  {copy.description ? (
                    <p className="max-w-165 text-[0.9375rem] text-ink-secondary">
                      {copy.description}
                    </p>
                  ) : null}
                </div>
                <div
                  className={
                    copy.centered
                      ? "mx-auto grid w-full max-w-full grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[992px]:max-w-205 min-[992px]:gap-7"
                      : "grid w-full grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[992px]:grid-cols-3 min-[992px]:gap-7"
                  }
                >
                  {section.products.map((product) => (
                    <ProductCard
                      key={product.sku}
                      product={product}
                      cartUrl={cartUrl}
                      onOpenLightbox={(item) => setActiveLightboxProduct(item)}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <div
          className="mt-10 rounded-card border border-border-hairline bg-white px-5 py-3.5 text-center"
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
