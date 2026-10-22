import { prisma } from "@/lib/prisma";
import type { IStockProduct } from "@/types/admin-stock";
import "server-only";

export async function getStockProducts(): Promise<IStockProduct[]> {
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      sku: true,
      name: true,
      capacity: true,
      active: true,
      stock: true,
      category: { select: { name: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        select: { url: true, isPrimary: true },
      },
    },
  });

  return products.map((product) => {
    const primary =
      product.images.find((image) => image.isPrimary) ?? product.images[0];

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category.name,
      capacity: product.capacity,
      image: primary?.url ?? "",
      active: product.active,
      stock: product.stock,
    };
  });
}
