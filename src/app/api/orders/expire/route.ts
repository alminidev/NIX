import { expireOverdueOrders } from "@/lib/orders";
import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const received = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

/**
 * Expira os pedidos aguardando pagamento que passaram do prazo e devolve o
 * estoque. Feita para ser chamada por um cron com
 * `Authorization: Bearer <CRON_SECRET>` (a Vercel envia esse cabeçalho sozinha
 * quando CRON_SECRET está definido). Sem CRON_SECRET configurado, recusa tudo.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

  const expired = await expireOverdueOrders();
  if (expired > 0) revalidateTag("products", { expire: 0 });

  return Response.json({ expired });
}
