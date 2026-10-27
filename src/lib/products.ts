import { prisma } from "@/lib/prisma";
import type { IProduct } from "@/types/product";
import { cacheLife, cacheTag } from "next/cache";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export async function getProducts(): Promise<IProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: {
      category: true,
      specifications: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return products.map((product) => {
    const primary =
      product.images.find((image) => image.isPrimary) ?? product.images[0];
    const urls = product.images.map((image) => image.url);

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category.name,
      categorySlug: product.category.slug,
      categorySortOrder: product.category.sortOrder,
      capacity: product.capacity,
      dimensions: {
        width: Number(product.width),
        height: Number(product.height),
        depth: Number(product.depth),
      },
      price: Number(product.price),
      formattedPrice: currency.format(Number(product.price)),
      installments: product.installments,
      description: product.description,
      specifications: product.specifications.map((item) => item.text),
      image: primary?.url ?? "",
      images: urls.length > 1 ? urls : undefined,
      featured: product.featured,
    };
  });
}
