import { InsufficientStockError } from "@/app/_errors/insufficient-stock.error";
import { AppError } from "@/app/_errors/app.error";
import { calculateSubtotal, calculateTotal } from "@/lib/cart-calculation";
import { prisma } from "@/lib/prisma";
import type { IOrderCreated, IOrderInput } from "@/types/order";
import "server-only";

/**
 * Cria o pedido a partir do carrinho, numa única transação:
 *
 * 1. baixa o estoque de cada produto com um UPDATE condicional
 *    (stock >= quantidade), que é atômico no banco. Duas compras ao mesmo
 *    tempo nunca deixam o estoque negativo: a que perder falha;
 * 2. lê o preço atual de cada produto e o congela no item do pedido;
 * 3. grava o pedido com o subtotal, o frete e o total.
 *
 * Se qualquer produto não tiver estoque, nada é gravado e o erro explica qual.
 */
export async function createOrder(input: IOrderInput): Promise<IOrderCreated> {
  // Ordem fixa por produto: evita deadlock entre pedidos simultâneos.
  const items = [...input.items].sort((a, b) => a.productId - b.productId);

  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const reserved = await tx.product.updateMany({
        where: {
          id: item.productId,
          active: true,
          stock: { gte: item.quantity },
        },
        data: { stock: { decrement: item.quantity } },
      });

      if (reserved.count === 1) continue;

      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { name: true, stock: true, active: true },
      });

      if (!product || !product.active) {
        throw new AppError(
          "Um produto do carrinho não está mais disponível.",
          409,
        );
      }

      throw new InsufficientStockError(product.name, product.stock);
    }

    const products = await tx.product.findMany({
      where: { id: { in: items.map((item) => item.productId) } },
      select: { id: true, price: true },
    });
    const prices = new Map(
      products.map((product) => [product.id, product.price]),
    );
    const orderItems = items.flatMap((item) => {
      const unitPrice = prices.get(item.productId);
      return unitPrice
        ? [{ productId: item.productId, quantity: item.quantity, unitPrice }]
        : [];
    });

    const subtotal = calculateSubtotal(
      orderItems.map((item) => ({
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
      })),
    );
    const total = calculateTotal(subtotal, input.shipping);

    const order = await tx.order.create({
      data: {
        source: input.source ?? "SITE",
        subtotal,
        shipping: input.shipping,
        total,
        customerName: input.customer.name,
        customerEmail: input.customer.email,
        customerPhone: input.customer.phone,
        postalCode: input.address.postalCode,
        street: input.address.street,
        number: input.address.number,
        complement: input.address.complement || null,
        neighborhood: input.address.neighborhood,
        city: input.address.city,
        state: input.address.state,
        items: { create: orderItems },
      },
      select: { id: true },
    });

    return { id: order.id, subtotal, shipping: input.shipping, total };
  });
}
