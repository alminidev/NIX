import type { IAdminCategoryRecord } from "@/types/admin-category";
import CategoryForm from "@/views/AdminCategoriesView/components/CategoryForm";

interface ICategoryEditorProps {
  category?: IAdminCategoryRecord;
  nextSortOrder: number;
}

export function CategoryEditor({
  category,
  nextSortOrder,
}: ICategoryEditorProps) {
  return (
    <CategoryForm
      key={JSON.stringify({ category, nextSortOrder })}
      category={category}
      nextSortOrder={nextSortOrder}
    />
  );
}
