import type { IAdminCategory, IAdminProduct } from "@/types/admin-product";
import ProductForm from "@/views/AdminProductsView/components/ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface IProductEditorProps {
  categories: IAdminCategory[];
  product?: IAdminProduct;
  nextSortOrder: number;
}

export function ProductEditor({
  categories,
  product,
  nextSortOrder,
}: IProductEditorProps) {
  if (categories.length === 0) {
    return (
      <div className="flex w-full flex-1 flex-col">
        <header className="flex min-h-18 items-center border-b border-border-hairline bg-surface-card px-5 min-[861px]:px-8">
          <Link
            href="/admin/products"
            className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-ink-primary"
          >
            <ArrowLeft size={16} aria-hidden />
            Produtos
          </Link>
        </header>
        <p
          className="m-auto max-w-md px-6 text-center text-[0.9375rem] text-ink-secondary"
          role="status"
        >
          Nenhuma categoria cadastrada. Rode o seed do banco antes de criar
          produtos.
        </p>
      </div>
    );
  }

  return (
    <ProductForm
      categories={categories}
      product={product}
      nextSortOrder={nextSortOrder}
    />
  );
}
