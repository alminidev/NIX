"use client";

import type { IStockProduct } from "@/types/admin-stock";
import { StockRow } from "@/views/AdminStockView/components/StockRow";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

interface IStockListProps {
  products: IStockProduct[];
}

export default function StockList({ products }: IStockListProps) {
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
    <section className="flex flex-col gap-4" aria-labelledby="lista-estoque">
      <h2 id="lista-estoque" className="sr-only">
        Estoque por produto
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
              <StockRow key={product.id} product={product} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
