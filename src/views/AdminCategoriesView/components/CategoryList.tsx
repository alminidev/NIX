"use client";

import type { IAdminCategoryRecord } from "@/types/admin-category";
import { Pencil, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface ICategoryListProps {
  categories: IAdminCategoryRecord[];
}

function productLabel(count: number) {
  if (count === 0) return "Nenhum produto";
  if (count === 1) return "1 produto";
  return `${count} produtos`;
}

export default function CategoryList({ categories }: ICategoryListProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLocaleLowerCase("pt-BR");

  const visible = useMemo(() => {
    if (!query) return categories;
    return categories.filter((category) =>
      [category.name, category.slug]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(query),
    );
  }, [categories, query]);

  return (
    <section className="flex flex-col gap-4" aria-labelledby="lista-categorias">
      <h2 id="lista-categorias" className="sr-only">
        Lista de categorias
      </h2>

      <label className="relative block max-w-105">
        <span className="sr-only">Buscar categoria</span>
        <Search
          size={16}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou identificador"
          className="min-h-11 w-full rounded-pill border border-border-hairline bg-surface-card pr-4 pl-10 text-sm text-ink-primary focus:border-brand-blue focus:outline-2 focus:outline-offset-1 focus:outline-border-focus"
        />
      </label>

      <div className="overflow-hidden rounded-card border border-border-hairline bg-surface-card">
        {visible.length === 0 ? (
          <p className="px-6 py-12 text-center text-[0.9375rem] text-ink-muted">
            {query
              ? `Nenhuma categoria encontrada para “${search.trim()}”.`
              : "Nenhuma categoria cadastrada."}
          </p>
        ) : (
          <ul className="flex list-none flex-col">
            {visible.map((category) => (
              <li
                key={category.id}
                className="flex flex-col gap-4 border-t border-border-hairline px-4 py-4 first:border-t-0 min-[780px]:flex-row min-[780px]:items-center min-[780px]:px-5"
              >
                <div className="min-w-0 flex-1">
                  <strong className="text-[0.9375rem] leading-snug font-semibold text-ink-primary">
                    {category.name}
                  </strong>
                  <p className="mt-1 truncate text-[0.8125rem] text-ink-muted">
                    {category.slug} · ordem {category.sortOrder} ·{" "}
                    {productLabel(category.productCount)}
                  </p>
                </div>

                <Link
                  href={`/admin/categories/${category.id}`}
                  className="inline-flex min-h-10 w-fit shrink-0 items-center justify-center gap-1.5 rounded-pill border border-border-hairline bg-surface-card px-3 text-sm font-semibold text-ink-primary transition-[background-color,border-color] duration-200 ease-nix hover:border-[rgba(23,107,255,0.35)] hover:bg-brand-blue-subtle hover:text-brand-blue-hover"
                >
                  <Pencil size={16} aria-hidden />
                  Editar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
