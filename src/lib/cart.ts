import { prisma } from "@/lib/prisma";
import { summarizeCart, type ICartProductData } from "@/lib/cart-calculation";
import type { ICartItem, ICartSummary } from "@/types/cart";
import "server-only";

/**
 * Resolve o carrinho com os dados atuais do banco: preço, estoque e
 * disponibilidade nunca vêm do navegador.
 */
export async function resolveCart(items: ICartItem[]): Promise<ICartSummary> {
  if (items.length === 0) return summarizeCart([], new Map());

  const records = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) } },
    select: {
      id: true,
      sku: true,
      name: true,
      capacity: true,
      width: true,
      height: true,
      length: true,
      price: true,
      stock: true,
      active: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: { url: true, isPrimary: true },
      },
    },
  });

  const products = new Map<number, ICartProductData & { active: boolean }>();

  for (const record of records) {
    const primary =
      record.images.find((image) => image.isPrimary) ?? record.images[0];

    products.set(record.id, {
      id: record.id,
      sku: record.sku,
      name: record.name,
      capacity: record.capacity,
      image: primary?.url ?? "",
      dimensions: {
        width: Number(record.width),
        height: Number(record.height),
        length: Number(record.length),
      },
      price: Number(record.price),
      stock: record.stock,
      active: record.active,
    });
  }

  return summarizeCart(items, products);
}
