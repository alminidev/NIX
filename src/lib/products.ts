import { prisma } from "@/lib/prisma";
import { catalogProductionTime } from "@/lib/production-time";
import { getProductionTimeTemplate } from "@/lib/shop-settings";
import type { IProduct } from "@/types/product";
import { cacheLife, cacheTag } from "next/cache";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

async function getCachedProducts(): Promise<IProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  // O card só pede 110V/220V quando requiresVoltage está ligado.

  // O modelo global entra neste cache de horas. saveShopSettings chama
  // updateTag("products"), então a vitrine troca a frase quando Configurações muda.
  const [products, globalTemplate] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: {
        category: true,
        specifications: { orderBy: { sortOrder: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    getProductionTimeTemplate(),
  ]);

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
        length: Number(product.length),
      },
      weight: Number(product.weight),
      price: Number(product.price),
      formattedPrice: currency.format(Number(product.price)),
      installments: product.installments,
      description: product.description,
      specifications: product.specifications.map((item) => item.text),
      image: primary?.url ?? "",
      images: urls.length > 1 ? urls : undefined,
      inStock: product.stock > 0,
      featured: product.featured,
      requiresVoltage: product.requiresVoltage,
      productionDays: product.productionDays,
      productionTimeText: catalogProductionTime(
        product.productionDays,
        product.productionTimeTemplate,
        globalTemplate,
      ).productionTimeText,
    };
  });
}

export async function getProducts(): Promise<IProduct[]> {
  return getCachedProducts();
}
