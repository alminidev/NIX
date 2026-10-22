"use client";

import type { IAdminProduct } from "@/types/admin-product";
import { Pencil, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import DeleteProductButton from "./DeleteProductButton";

interface IProductListProps {
  products: IAdminProduct[];
}

export default function ProductList({ products }: IProductListProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLocaleLowerCase("pt-BR");

  const visible = useMemo(() => {
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.sku, product.category, product.capacity]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(query),
    );
  }, [products, query]);

  return (
    <section className="flex flex-col gap-4" aria-labelledby="lista-produtos">
      <h2 id="lista-produtos" className="sr-only">
        Lista de produtos
      </h2>

      <label className="relative block max-w-105">
        <span className="sr-only">Buscar produto</span>
        <Search
          size={16}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome, SKU ou categoria"
          className="min-h-11 w-full rounded-pill border border-border-hairline bg-surface-card pr-4 pl-10 text-sm text-ink-primary focus:border-brand-blue focus:outline-2 focus:outline-offset-1 focus:outline-border-focus"
        />
      </label>

      <div className="overflow-hidden rounded-card border border-border-hairline bg-surface-card">
        {visible.length === 0 ? (
          <p className="px-6 py-12 text-center text-[0.9375rem] text-ink-muted">
            {query
              ? `Nenhum produto encontrado para “${search.trim()}”.`
              : "Nenhum produto cadastrado."}
          </p>
        ) : (
          <ul className="flex list-none flex-col">
            {visible.map((product) => (
              <li
                key={product.id}
                className="flex flex-col gap-4 border-t border-border-hairline px-4 py-4 first:border-t-0 min-[780px]:flex-row min-[780px]:items-center min-[780px]:px-5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-input border border-black/4 bg-white">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt=""
                        width={64}
                        height={64}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[0.6875rem] text-ink-muted">
                        Sem foto
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-[0.9375rem] leading-snug font-semibold text-ink-primary">
                        {product.name}
                      </strong>
                      <Status product={product} />
                    </div>
                    <p className="mt-1 truncate text-[0.8125rem] text-ink-muted">
                      {product.sku} · {product.category} · {product.capacity}
                    </p>
                  </div>
                </div>

                <p className="text-[0.9375rem] font-bold tracking-[-0.02em] text-ink-primary min-[780px]:w-32 min-[780px]:text-right">
                  {product.formattedPrice}
                </p>

                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-pill border border-border-hairline bg-surface-card px-3 text-sm font-semibold text-ink-primary transition-[background-color,border-color] duration-200 ease-nix hover:border-[rgba(23,107,255,0.35)] hover:bg-brand-blue-subtle hover:text-brand-blue-hover"
                  >
                    <Pencil size={16} aria-hidden />
                    Editar
                  </Link>
                  <DeleteProductButton
                    id={product.id}
                    name={product.name}
                    compact
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Status({ product }: { product: IAdminProduct }) {
  return (
    <>
      <span
        className={
          product.active
            ? "rounded-pill bg-brand-blue-subtle px-2 py-0.5 text-[0.6875rem] font-bold tracking-[0.04em] text-brand-blue-hover uppercase"
            : "rounded-pill bg-surface-canvas-fog px-2 py-0.5 text-[0.6875rem] font-bold tracking-[0.04em] text-ink-muted uppercase"
        }
      >
        {product.active ? "Ativo" : "Inativo"}
      </span>
      {product.featured ? (
        <span className="rounded-pill bg-ink-primary px-2 py-0.5 text-[0.6875rem] font-bold tracking-[0.04em] text-ink-inverse uppercase">
          Destaque
        </span>
      ) : null}
    </>
  );
}
