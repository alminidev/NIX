import { prisma } from "@/lib/prisma";
import type { IAdminCategoryRecord } from "@/types/admin-category";
import "server-only";

const categoryInclude = {
  _count: { select: { products: true } },
};

type TCategoryRecord = Awaited<
  ReturnType<
    typeof prisma.category.findMany<{ include: typeof categoryInclude }>
  >
>[number];

function toAdminCategory(category: TCategoryRecord): IAdminCategoryRecord {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    sortOrder: category.sortOrder,
    productCount: category._count.products,
  };
}

export async function getAdminCategoryList(): Promise<IAdminCategoryRecord[]> {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: categoryInclude,
  });

  return categories.map(toAdminCategory);
}

export async function getAdminCategory(
  id: number,
): Promise<IAdminCategoryRecord | null> {
  const category = await prisma.category.findUnique({
    where: { id },
    include: categoryInclude,
  });

  return category ? toAdminCategory(category) : null;
}

export async function getNextCategorySortOrder() {
  const last = await prisma.category.aggregate({ _max: { sortOrder: true } });
  return (last._max.sortOrder ?? 0) + 1;
}
