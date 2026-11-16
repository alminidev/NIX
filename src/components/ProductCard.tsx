"use client";

import ProductPurchaseActions from "@/components/ProductPurchaseActions";
import { formatDimensions } from "@/lib/product-dimensions";
import type { IProduct } from "@/types/product";
import Image from "next/image";
import { type MouseEvent } from "react";

interface IProductCardProps {
  product: IProduct;
  onOpenDetail: (product: IProduct) => void;
  /** Primeiro card da vitrine, acima da dobra. */
  preload?: boolean;
}

/**
 * ProductCard — Card individual de produto.
 * data-sku e data-id preservados para compatibilidade futura.
 * O clique no card abre o detalhe. A descrição fica só nesse detalhe.
 */
export default function ProductCard({
  product,
  onOpenDetail,
  preload = false,
}: IProductCardProps) {
  function openFromCard(event: MouseEvent<HTMLElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("a, button")) return;
    onOpenDetail(product);
  }

  return (
    <article
      className="group relative flex cursor-pointer flex-col rounded-card border border-border-hairline bg-surface-card p-6 transition-[translate,box-shadow,border-color] duration-[250ms] ease-nix hover:-translate-y-[3px] hover:border-[rgba(23,107,255,0.3)] hover:shadow-card-hover"
      data-sku={product.sku}
      data-id={product.id}
      onClick={openFromCard}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-pill bg-brand-blue-subtle px-2.5 py-1 text-xs font-semibold text-brand-blue-hover">
          {product.capacity}
        </span>
        {product.featured && (
          <span className="rounded-pill bg-ink-primary px-2 py-1 text-[0.6875rem] font-bold tracking-[0.05em] text-ink-inverse uppercase">
            Mais Escolhido
          </span>
        )}
      </div>

      <div className="relative mb-5 aspect-square w-full overflow-hidden rounded-input border border-black/[0.03] bg-white">
        <button
          type="button"
          className="absolute inset-0 cursor-pointer bg-transparent p-0 focus-visible:rounded-input"
          onClick={() => onOpenDetail(product)}
          aria-label={`Ver detalhes de ${product.name}`}
        >
          <Image
            src={product.image}
            alt={`${product.name} — Armazenamento com controle térmico para filamentos 3D`}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 991px) 50vw, 33vw"
            preload={preload}
            className="object-contain p-4 transition-[scale] duration-[250ms] ease-nix group-hover:scale-[1.02]"
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="mb-4 text-xl leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
          {product.name}
        </h3>

        <div className="mb-3.5 flex flex-col gap-0.5 rounded-input border border-border-hairline bg-surface-canvas-fog px-3 py-2">
          <span className="text-[0.6875rem] font-semibold tracking-[0.05em] text-ink-muted uppercase">
            Dimensões (C x L x A)
          </span>
          <span className="text-[0.8125rem] font-semibold text-ink-primary">
            {formatDimensions(product.dimensions)}
          </span>
        </div>

        {product.specifications.length > 0 && (
          <ul className="mb-5 list-none border-t border-border-hairline pt-3.5">
            {product.specifications.map((spec, i) => (
              <li
                key={i}
                className="mb-1.5 flex items-start gap-2 text-[0.8125rem] leading-[1.4] text-ink-muted before:font-bold before:text-brand-blue before:content-['•']"
              >
                {spec}
              </li>
            ))}
          </ul>
        )}

        <ProductPurchaseActions product={product} />
      </div>
    </article>
  );
}
