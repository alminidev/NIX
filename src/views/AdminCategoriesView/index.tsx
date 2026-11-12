import type {
  IAdminCategoryRecord,
  TCategoryNotice,
} from "@/types/admin-category";
import CategoryList from "@/views/AdminCategoriesView/components/CategoryList";
import { Plus } from "lucide-react";
import Link from "next/link";

interface IAdminCategoriesViewProps {
  categories: IAdminCategoryRecord[];
  notice: TCategoryNotice | null;
}

const noticeMessage: Record<TCategoryNotice, string> = {
  created: "Categoria criada.",
  updated: "Categoria atualizada.",
};

export function AdminCategoriesView({
  categories,
  notice,
}: IAdminCategoriesViewProps) {
  const total = categories.length;
  const message = notice ? noticeMessage[notice] : null;

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <div className="flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-end min-[720px]:justify-between">
        <header>
          <p className="mb-2 inline-block text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
            Catálogo
          </p>
          <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
            Categorias
          </h1>
          <p className="mt-2 max-w-140 text-[0.9375rem] text-ink-secondary">
            {total === 0
              ? "Cadastre a primeira categoria da vitrine."
              : `${total} ${total === 1 ? "categoria" : "categorias"} no catálogo. A ordem define a sequência das seções na home.`}
          </p>
        </header>

        <Link
          href="/admin/categories/new"
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-pill bg-brand-blue px-5 text-sm font-medium text-ink-inverse transition-[background-color,translate] duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover"
        >
          <Plus size={16} aria-hidden />
          Nova categoria
        </Link>
      </div>

      {message ? (
        <p
          className="rounded-input border border-[rgba(23,107,255,0.2)] bg-brand-blue-subtle px-4 py-3 text-sm text-brand-blue-hover"
          role="status"
        >
          {message}
        </p>
      ) : null}

      <CategoryList categories={categories} />
    </div>
  );
}
