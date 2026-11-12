import FreshNavigation from "@/components/FreshNavigation";
import { getAdminCategory } from "@/lib/admin-categories";
import { getSession } from "@/lib/session";
import { CategoryEditor } from "@/views/AdminCategoriesView/components/CategoryEditor";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Editar categoria — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

interface IEditCategoryPageProps {
  params: Promise<{ id: string }>;
}

async function EditCategory({ params }: IEditCategoryPageProps) {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const { id: rawId } = await params;
  if (!/^\d+$/.test(rawId)) notFound();
  const id = Number(rawId);

  const category = await getAdminCategory(id);
  if (!category) notFound();

  return (
    <CategoryEditor category={category} nextSortOrder={category.sortOrder} />
  );
}

export default function EditCategoryPage({ params }: IEditCategoryPageProps) {
  return (
    <FreshNavigation>
      <Suspense
        fallback={
          <p className="text-[0.9375rem] text-ink-muted">
            Carregando categoria…
          </p>
        }
      >
        <EditCategory params={params} />
      </Suspense>
    </FreshNavigation>
  );
}
