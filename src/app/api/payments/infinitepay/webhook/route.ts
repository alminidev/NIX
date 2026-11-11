import { handleInfinitePayWebhook } from "@/lib/payments";
import { revalidateTag } from "next/cache";

/**
 * Webhook da InfinitePay. O token da URL só reduz spam; o pagamento só vira
 * PAID depois do payment_check. Sem INFINITEPAY_WEBHOOK_SECRET, recusa tudo.
 */
export async function POST(request: Request) {
  const result = await handleInfinitePayWebhook(request);

  if (result.stockChanged) revalidateTag("products", { expire: 0 });

  if (result.status === 401) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (result.status === 400) {
    return Response.json(
      { error: "Não foi possível processar." },
      { status: 400 },
    );
  }

  return Response.json({ ok: true });
}
