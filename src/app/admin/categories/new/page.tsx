import FreshNavigation from "@/components/FreshNavigation";
import { getNextCategorySortOrder } from "@/lib/admin-categories";
import { getSession } from "@/lib/session";
import { CategoryEditor } from "@/views/AdminCategoriesView/components/CategoryEditor";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Nova categoria — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

async function NewCategory() {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const nextSortOrder = await getNextCategorySortOrder();

  return <CategoryEditor nextSortOrder={nextSortOrder} />;
}

export default function NewCategoryPage() {
  return (
    <FreshNavigation>
      <Suspense
        fallback={
          <p className="text-[0.9375rem] text-ink-muted">
            Carregando formulário…
          </p>
        }
      >
        <NewCategory />
      </Suspense>
    </FreshNavigation>
  );
}
