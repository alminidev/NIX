import { calculateShipping, shippingMessages } from "@/lib/shipping";
import {
  isLocalPickup,
  localPickupOption,
  localPickupQuote,
  offerLocalPickup,
} from "@/lib/shipping-display";
import { errorQuote } from "@/lib/shipping-shared";
import type { ICartLine, IShippingOption, IShippingQuote } from "@/types/cart";
import "server-only";

/**
 * Frete gravado no pedido. A retirada no local não consulta o provedor.
 * A entrega repete a cotação do carrinho. Se o serviço escolhido não estiver
 * entre as opções filtradas, ou se o preço ou o prazo mostrados no carrinho
 * divergirem da opção recotada, devolve erro e o pedido não é criado. O
 * preço gravado é o da recotação, nunca o valor enviado pelo navegador.
 */
export async function quoteOrderShipping(input: {
  postalCode: string;
  lines: ICartLine[];
  serviceId: number | null;
  /** Preço exibido no carrinho. Ausente, a recotação não compara. */
  displayedPrice?: number | null;
  /** Prazo exibido no carrinho, em dias úteis. Ausente, a recotação não compara. */
  displayedDays?: number | null;
}): Promise<IShippingQuote> {
  if (isLocalPickup(input.serviceId)) {
    if (
      displayedSelectionChanged(
        localPickupOption,
        input.displayedPrice,
        input.displayedDays,
      )
    ) {
      return errorQuote(shippingMessages.optionsChanged);
    }

    return localPickupQuote();
  }

  const quote = await calculateShipping({
    postalCode: input.postalCode,
    lines: input.lines,
    serviceId: input.serviceId,
    strictService: true,
  });

  if (quote.status !== "quoted" || quote.price === null) return quote;

  const chosen = quote.options.find(
    (option) => option.serviceId === quote.serviceId,
  );
  if (
    chosen &&
    displayedSelectionChanged(
      chosen,
      input.displayedPrice,
      input.displayedDays,
    )
  ) {
    return errorQuote(shippingMessages.optionsChanged);
  }

  return offerLocalPickup(quote, input.serviceId);
}

function sameCents(left: number, right: number) {
  return Math.round(left * 100) === Math.round(right * 100);
}

/** O carrinho pode omitir os dois. Se vier um valor, ele tem de bater com a recotação. */
function displayedSelectionChanged(
  option: Pick<IShippingOption, "price" | "deliveryDays">,
  displayedPrice: number | null | undefined,
  displayedDays: number | null | undefined,
) {
  if (displayedPrice != null && !sameCents(displayedPrice, option.price)) {
    return true;
  }

  return displayedDays != null && displayedDays !== option.deliveryDays;
}
