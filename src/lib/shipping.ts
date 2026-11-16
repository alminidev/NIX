import { quoteCentralDoFrete } from "@/lib/shipping-central-do-frete";
import { presentShippingChoices } from "@/lib/shipping-display";
import { quoteMelhorEnvio } from "@/lib/shipping-melhor-envio";
import type { TShippingProvider } from "@/lib/shipping-provider";
import {
  errorQuote,
  lineCanShip,
  shippingMessages,
  type IShippingRequest,
} from "@/lib/shipping-shared";
import { getShippingProvider } from "@/lib/shop-settings";
import type { IShippingQuote } from "@/types/cart";
import "server-only";

export type { IShippingRequest } from "@/lib/shipping-shared";
export { shippingMessages, shippingTimeoutMs } from "@/lib/shipping-shared";

/**
 * Cota o frete no provedor ativo (Melhor Envio ou Central do Frete).
 * Sem registro de configuração, usa o Melhor Envio. Só calcula: a etiqueta
 * não é comprada e a entrega é feita por fora. Nunca lança e nunca devolve
 * o token. A pessoa vê a opção de preço intermediário (padrão, maior prazo)
 * e a mais cara (menor prazo).
 */
export async function calculateShipping(
  request: IShippingRequest,
): Promise<IShippingQuote> {
  if (request.lines.length === 0) {
    return errorQuote(shippingMessages.unavailable);
  }

  if (request.lines.some((line) => !lineCanShip(line))) {
    return errorQuote(shippingMessages.missingPackage);
  }

  let provider: TShippingProvider;
  try {
    provider = await getShippingProvider();
  } catch {
    console.error("Não foi possível ler o provedor de frete.");
    return errorQuote(shippingMessages.unavailable);
  }

  const quote =
    provider === "central_do_frete"
      ? await quoteCentralDoFrete(request)
      : await quoteMelhorEnvio(request);

  if (quote.status === "error") return errorQuote(quote.message);

  const options = presentShippingChoices(quote.options);
  if (options.length === 0) return errorQuote(shippingMessages.uncovered);

  const picked =
    options.find((option) => option.serviceId === request.serviceId) ??
    options[0];

  return {
    status: "quoted",
    price: picked.price,
    deliveryDays: picked.deliveryDays,
    message: null,
    serviceId: picked.serviceId,
    company: null,
    serviceName: null,
    options,
  };
}
