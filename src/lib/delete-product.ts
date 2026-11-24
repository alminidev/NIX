import { prisma } from "@/lib/prisma";
import { productDeletionOrderStatuses } from "@/lib/order-status";
import "server-only";

/** Texto do item quando o produto do pedido já foi excluído. */
export const deletedProductLabel = "Produto não encontrado ou excluído";

/** Erro mostrado quando ainda há pedido fora de cancelado ou enviado. */
export const productHasOpenOrdersMessage =
  "Existem pedidos em andamento atrelados a este produto. Desative-o para tirá-lo da vitrine.";

export type TDeleteProductResult =
  | { ok: true }
  | { ok: false; reason: "not-found" | "in-use" };

function prismaCode(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = error.code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

/**
 * Exclui o produto. Pedidos cancelados, expirados ou enviados soltam o item
 * (productId nulo) e continuam no histórico. Qualquer outro status mantém o
 * vínculo e a exclusão falha, com a transação desfeita. A chave estrangeira
 * em RESTRICT cobre um pedido novo que entre no meio do caminho.
 */
export async function deleteProductById(
  id: number,
): Promise<TDeleteProductResult> {
  try {
    await prisma.$transaction(async (tx) => {
      const items = await tx.orderItem.findMany({
        where: {
          productId: id,
          order: { status: { in: productDeletionOrderStatuses } },
        },
        select: { id: true },
      });

      for (const item of items) {
        await tx.orderItem.update({
          where: { id: item.id },
          data: { product: { disconnect: true } },
        });
      }

      await tx.product.delete({ where: { id } });
    });

    return { ok: true };
  } catch (error) {
    if (prismaCode(error) === "P2025") return { ok: false, reason: "not-found" };
    if (prismaCode(error) === "P2003") return { ok: false, reason: "in-use" };
    throw error;
  }
}
