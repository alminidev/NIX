import { calculateShipping } from "@/lib/shipping";
import {
  isLocalPickup,
  localPickupQuote,
  offerLocalPickup,
} from "@/lib/shipping-display";
import type { ICartLine, IShippingQuote } from "@/types/cart";
import "server-only";

/**
 * Frete gravado no pedido. A retirada no local não consulta o Melhor Envio.
 * A entrega usa a mesma cotação do carrinho, e o preço não vem do navegador.
 */
export async function quoteOrderShipping(input: {
  postalCode: string;
  lines: ICartLine[];
  serviceId: number | null;
}): Promise<IShippingQuote> {
  if (isLocalPickup(input.serviceId)) return localPickupQuote();

  return offerLocalPickup(
    await calculateShipping({
      postalCode: input.postalCode,
      lines: input.lines,
      serviceId: input.serviceId,
    }),
    input.serviceId,
  );
}
