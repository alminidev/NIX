import FreshNavigation from "@/components/FreshNavigation";
import { getAdminCategoryList } from "@/lib/admin-categories";
import { getSession } from "@/lib/session";
import type { TCategoryNotice } from "@/types/admin-category";
import { AdminCategoriesView } from "@/views/AdminCategoriesView";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Categorias — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

interface ICategoriesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readNotice(
  value: string | string[] | undefined,
): TCategoryNotice | null {
  const notice = Array.isArray(value) ? value[0] : value;
  if (notice === "created" || notice === "updated") return notice;
  return null;
}

async function Categories({ searchParams }: ICategoriesPageProps) {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const params = await searchParams;
  const categories = await getAdminCategoryList();

  return (
    <AdminCategoriesView
      categories={categories}
      notice={readNotice(params.notice)}
    />
  );
}

export default function CategoriesPage({ searchParams }: ICategoriesPageProps) {
  return (
    <FreshNavigation>
      <Suspense
        fallback={
          <p className="text-[0.9375rem] text-ink-muted">
            Carregando categorias…
          </p>
        }
      >
        <Categories searchParams={searchParams} />
      </Suspense>
    </FreshNavigation>
  );
}
