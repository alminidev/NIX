import "server-only";
import { getAdminOrder } from "@/lib/admin-orders";
import {
  buildOrderPdfModel,
  orderPdfDenial,
  orderPdfFilename,
} from "@/lib/order-pdf";
import { renderOrderPdf } from "@/lib/order-pdf-render";
import { getSession } from "@/lib/session";

const denied = "Acesso negado.";
const missing = "Pedido não encontrado.";

function text(body: string, status: number) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}

function parseOrderId(raw: string) {
  if (!/^\d{1,10}$/.test(raw)) return null;
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1 || id > 2_147_483_647) return null;
  return id;
}

/** PDF do pedido para o admin. Recusa quem não é admin, id inválido e status não pago. */
export async function createOrderPdfResponse(rawId: string) {
  const session = await getSession();
  if (session?.user.role !== "admin") return text(denied, 403);

  const id = parseOrderId(rawId);
  if (id === null) return text(missing, 404);

  const order = await getAdminOrder(id);
  if (!order) return text(missing, 404);

  const denial = orderPdfDenial(order.status);
  if (denial) return text(denial, 409);

  const bytes = await renderOrderPdf(buildOrderPdfModel(order));
  const body = Uint8Array.from(bytes);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${orderPdfFilename(order.id)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
