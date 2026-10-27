import { prisma } from "@/lib/prisma";
import type { IAdminCategory, IAdminProduct } from "@/types/admin-product";
import "server-only";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const priceInput = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const productInclude = {
  category: true,
  specifications: { orderBy: { sortOrder: "asc" as const } },
  images: { orderBy: { sortOrder: "asc" as const } },
};

type TProductRecord = Awaited<
  ReturnType<typeof prisma.product.findMany<{ include: typeof productInclude }>>
>[number];

function toAdminProduct(product: TProductRecord): IAdminProduct {
  const primary =
    product.images.find((image) => image.isPrimary) ?? product.images[0];

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    categoryId: product.categoryId,
    category: product.category.name,
    capacity: product.capacity,
    dimensions: {
      width: Number(product.width),
      height: Number(product.height),
      depth: Number(product.depth),
    },
    price: priceInput.format(Number(product.price)),
    formattedPrice: currency.format(Number(product.price)),
    installments: product.installments,
    description: product.description,
    specifications: product.specifications.map((item) => item.text),
    images: product.images.map((image) => ({
      url: image.url,
      isPrimary: image.isPrimary,
    })),
    image: primary?.url ?? "",
    featured: product.featured,
    active: product.active,
    sortOrder: product.sortOrder,
  };
}

export async function getAdminProducts(): Promise<IAdminProduct[]> {
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: productInclude,
  });

  return products.map(toAdminProduct);
}

export async function getAdminProduct(
  id: number,
): Promise<IAdminProduct | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  return product ? toAdminProduct(product) : null;
}

export async function getAdminCategories(): Promise<IAdminCategory[]> {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
}

export async function getNextProductSortOrder() {
  const last = await prisma.product.aggregate({ _max: { sortOrder: true } });
  return (last._max.sortOrder ?? 0) + 1;
}
