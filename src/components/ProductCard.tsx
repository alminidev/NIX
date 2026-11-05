"use client";

import PaymentTerms from "@/components/PaymentTerms";
import { useCartContext, type TAddItemResult } from "@/contexts/CartContext";
import { formatDimensions } from "@/lib/product-dimensions";
import type { IProduct } from "@/types/product";
import { Lock, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface IProductCardProps {
  product: IProduct;
  onOpenLightbox?: (product: IProduct) => void;
  /** Primeiro card da vitrine, acima da dobra. */
  preload?: boolean;
}

/**
 * ProductCard — Card individual de produto.
 * data-sku e data-id preservados para compatibilidade futura.
 * Ao clicar na imagem, abre o overlay de visualização ampliada (Lightbox).
 */
export default function ProductCard({
  product,
  onOpenLightbox,
  preload = false,
}: IProductCardProps) {
  const { addItem } = useCartContext();
  const [adding, setAdding] = useState(false);
  const [result, setResult] = useState<TAddItemResult | null>(null);

  async function handleAdd() {
    setAdding(true);
    setResult(await addItem(product.id));
    setAdding(false);
  }

  const feedback: Record<TAddItemResult, string> = {
    added: "Produto adicionado ao carrinho.",
    limit: "Você já tem todas as unidades disponíveis no carrinho.",
    unavailable: "Este produto está indisponível no momento.",
    error: "Não foi possível adicionar. Tente novamente.",
  };

  return (
    <article
      className="group relative flex flex-col rounded-card border border-border-hairline bg-surface-card p-6 transition-[translate,box-shadow,border-color] duration-[250ms] ease-nix hover:-translate-y-[3px] hover:border-[rgba(23,107,255,0.3)] hover:shadow-card-hover"
      data-sku={product.sku}
      data-id={product.id}
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
          className="absolute inset-0 cursor-zoom-in bg-transparent p-0 focus-visible:rounded-input"
          onClick={() => onOpenLightbox?.(product)}
          aria-label={`Ampliar foto de ${product.name}`}
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
        <h3 className="mb-2 text-xl leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
          {product.name}
        </h3>
        <p className="mb-4 flex-1 text-[0.9375rem] leading-normal text-ink-secondary">
          {product.description}
        </p>

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

        <div className="mt-auto">
          <div className="mb-3.5 flex items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-ink-muted uppercase">
                Preço à vista
              </span>
              <span className="text-[1.375rem] font-bold tracking-[-0.02em] text-ink-primary">
                {product.formattedPrice}
              </span>
            </div>
            <span className="rounded-pill bg-brand-blue-subtle px-2 py-1 text-xs font-semibold whitespace-nowrap text-brand-blue-hover">
              {product.installments}
            </span>
          </div>
          <PaymentTerms className="mb-3.5" />

          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock || adding}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-button bg-brand-blue px-6 py-3 text-[0.9375rem] font-semibold text-ink-inverse transition-all duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            data-sku={product.sku}
            data-id={product.id}
            aria-label={
              product.inStock
                ? `Adicionar ${product.name} ao carrinho`
                : `${product.name} indisponível`
            }
          >
            {product.inStock ? "Adicionar ao carrinho" : "Indisponível"}
            <ShoppingCart size={16} aria-hidden />
          </button>

          <p
            className="text-center text-xs font-medium text-ink-secondary empty:hidden [&:not(:empty)]:mt-2"
            role="status"
          >
            {result ? feedback[result] : null}
            {result === "added" || result === "limit" ? (
              <>
                {" "}
                <Link
                  href="/cart"
                  className="font-semibold text-brand-blue-hover underline"
                >
                  Ver carrinho
                </Link>
              </>
            ) : null}
          </p>

          <div
            className="mt-2.5 flex items-center justify-center gap-1.5 text-[0.6875rem] font-medium text-ink-muted"
            aria-hidden="true"
          >
            <Lock size={12} className="text-brand-blue" aria-hidden />
            <span>Ambiente Seguro InfinitePay</span>
          </div>

          <span className="mt-1.5 block text-center text-xs font-medium text-ink-muted">
            Enviamos para todo o Brasil • Frete a consultar
          </span>
        </div>
      </div>
    </article>
  );
}
