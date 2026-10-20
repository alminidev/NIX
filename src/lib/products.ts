import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/product";
import { cacheLife, cacheTag } from "next/cache";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export async function getProducts(): Promise<Product[]> {
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
      capacity: product.capacity,
      dimensions: product.dimensions,
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
