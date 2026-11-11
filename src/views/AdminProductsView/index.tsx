import type { IAdminProduct } from "@/types/admin-product";
import ProductList from "@/views/AdminProductsView/components/ProductList";
import { Plus } from "lucide-react";
import Link from "next/link";

interface IAdminProductsViewProps {
  products: IAdminProduct[];
}

export function AdminProductsView({ products }: IAdminProductsViewProps) {
  const total = products.length;

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <div className="flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-end min-[720px]:justify-between">
        <header>
          <p className="mb-2 inline-block text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
            Catálogo
          </p>
          <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
            Produtos
          </h1>
          <p className="mt-2 max-w-140 text-[0.9375rem] text-ink-secondary">
            {total === 0
              ? "Cadastre o primeiro produto da NIX."
              : `${total} ${total === 1 ? "produto" : "produtos"} no catálogo, inclusive os inativos.`}
          </p>
        </header>

        <Link
          href="/admin/products/new"
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-pill bg-brand-blue px-5 text-sm font-medium text-ink-inverse transition-[background-color,translate] duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover"
        >
          <Plus size={16} aria-hidden />
          Novo produto
        </Link>
      </div>

      <ProductList products={products} />
    </div>
  );
}
