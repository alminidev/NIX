import { calculateShipping } from "@/lib/shipping";
import {
  isLocalPickup,
  localPickupQuote,
  offerLocalPickup,
} from "@/lib/shipping-display";
import type { ICartLine, IShippingQuote } from "@/types/cart";
import "server-only";

/**
 * Frete gravado no pedido. A retirada no local não consulta o provedor.
 * A entrega repete a cotação do carrinho. Se o serviço escolhido não estiver
 * entre as opções filtradas, devolve erro e o pedido não é criado. O preço
 * nunca vem do navegador.
 */
export async function quoteOrderShipping(input: {
  postalCode: string;
  lines: ICartLine[];
  serviceId: number | null;
}): Promise<IShippingQuote> {
  if (isLocalPickup(input.serviceId)) return localPickupQuote();

  const quote = await calculateShipping({
    postalCode: input.postalCode,
    lines: input.lines,
    serviceId: input.serviceId,
    strictService: true,
  });

  if (quote.status !== "quoted" || quote.price === null) return quote;

  return offerLocalPickup(quote, input.serviceId);
}
