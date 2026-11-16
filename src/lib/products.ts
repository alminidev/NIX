import { prisma } from "@/lib/prisma";
import { catalogProductionTime } from "@/lib/production-time";
import { getProductionTimeTemplate } from "@/lib/shop-settings";
import type { IProduct } from "@/types/product";
import { cacheLife, cacheTag } from "next/cache";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface ICachedProduct extends Omit<IProduct, "productionTimeText"> {
  /** Override só deste produto. Vazio usa o modelo lido fora do cache. */
  productionTimeTemplate: string | null;
}

async function getCachedProducts(): Promise<ICachedProduct[]> {
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
      productionDays: product.productionDays,
      productionTimeTemplate: product.productionTimeTemplate,
    };
  });
}

export async function getProducts(): Promise<IProduct[]> {
  // O modelo global fica fora do cache de horas. Senão a vitrine continua
  // com a frase antiga depois que Configurações muda.
  const [products, globalTemplate] = await Promise.all([
    getCachedProducts(),
    getProductionTimeTemplate(),
  ]);

  return products.map(({ productionTimeTemplate, ...product }) => ({
    ...product,
    productionTimeText: catalogProductionTime(
      product.productionDays,
      productionTimeTemplate,
      globalTemplate,
    ).productionTimeText,
  }));
}
