import { formatCurrency } from "@/lib/cart-calculation";
import type { IShippingOption, IShippingQuote } from "@/types/cart";

/** Id reservado: não existe no Melhor Envio. O preço é sempre zero. */
export const localPickupServiceId = 0;

export const localPickupOption: IShippingOption = {
  serviceId: localPickupServiceId,
  company: "",
  name: "Retirada no local",
  price: 0,
  deliveryDays: 0,
};

export const localPickupFallbackMessage =
  "Não foi possível cotar a entrega. A retirada no local continua disponível, sem custo.";

export function isLocalPickup(serviceId: number | null | undefined) {
  return serviceId === localPickupServiceId;
}

/** "Grátis" quando o frete é zero, para não parecer um valor somado ao pedido. */
export function formatShippingAmount(price: number) {
  return price === 0 ? "Grátis" : formatCurrency(price);
}

/**
 * Cotação só da retirada no local. O valor não vem do navegador nem do
 * Melhor Envio: a retirada é sempre grátis.
 */
export function localPickupQuote(
  carriers: IShippingOption[] = [],
  message: string | null = null,
): IShippingQuote {
  return {
    status: "quoted",
    price: 0,
    deliveryDays: null,
    message,
    serviceId: localPickupServiceId,
    company: null,
    serviceName: null,
    options: [
      ...carriers.filter((option) => !isLocalPickup(option.serviceId)),
      localPickupOption,
    ],
  };
}

/**
 * Inclui a retirada no local na cotação do carrinho.
 *
 * Com entrega disponível, ela entra no fim e a opção já escolhida continua
 * valendo. Se a pessoa escolheu a retirada, o frete fica zero. Se a cotação
 * da entrega falhou e nenhuma entrega foi escolhida, só a retirada aparece.
 */
export function offerLocalPickup(
  quote: IShippingQuote,
  serviceId?: number | null,
): IShippingQuote {
  if (isLocalPickup(serviceId)) {
    return localPickupQuote(quote.status === "quoted" ? quote.options : []);
  }

  if (quote.status !== "quoted" || quote.price === null) {
    if (quote.status === "error" && serviceId == null) {
      return localPickupQuote([], localPickupFallbackMessage);
    }

    return quote;
  }

  return {
    ...quote,
    options: [
      ...quote.options.filter((option) => !isLocalPickup(option.serviceId)),
      localPickupOption,
    ],
  };
}

/** Texto do prazo para a pessoa (ex.: "7 dias úteis"). */
export function formatDeliveryDays(days: number) {
  if (days === 0) return "No mesmo dia";
  if (days === 1) return "1 dia útil";
  return `${days} dias úteis`;
}

/** Rótulo da opção no carrinho. A retirada não usa prazo de entrega. */
export function shippingChoiceLabel(option: IShippingOption) {
  if (isLocalPickup(option.serviceId)) return localPickupOption.name;
  return formatDeliveryDays(option.deliveryDays);
}

function cents(value: number) {
  return Math.round(value * 100);
}

function byPrice(a: IShippingOption, b: IShippingOption) {
  return (
    cents(a.price) - cents(b.price) ||
    a.deliveryDays - b.deliveryDays ||
    a.serviceId - b.serviceId
  );
}

/**
 * Opção de preço intermediário: a mais próxima do centro entre a mais barata
 * e a mais cara. Empate fica com a de menor preço.
 */
function closestToRangeCenter(
  candidates: IShippingOption[],
  cheapestPrice: number,
  highestPrice: number,
) {
  const target = cents(cheapestPrice) + cents(highestPrice);

  return [...candidates].sort((a, b) => {
    const distanceA = Math.abs(cents(a.price) * 2 - target);
    const distanceB = Math.abs(cents(b.price) * 2 - target);
    return distanceA - distanceB || byPrice(a, b);
  })[0];
}

function choice(
  source: IShippingOption,
  deliveryDays: number,
): IShippingOption {
  return {
    serviceId: source.serviceId,
    company: "",
    name: "",
    price: source.price,
    deliveryDays,
  };
}

/**
 * Opções que a pessoa escolhe no checkout.
 *
 * A cotação só define valor e prazo: a entrega é feita por fora, então o
 * nome da transportadora não aparece. No máximo duas opções:
 * - a de preço intermediário, com o maior prazo, já vem primeiro;
 * - a mais cara, com o menor prazo.
 *
 * Com uma única cotação, só ela aparece. Com duas, a mais barata faz o
 * papel da intermediária.
 */
export function presentShippingChoices(
  options: IShippingOption[],
): IShippingOption[] {
  if (options.length === 0) return [];

  const sorted = [...options].sort(byPrice);
  const cheapestPrice = sorted[0].price;
  const highestPrice = sorted[sorted.length - 1].price;
  const maxDays = Math.max(...sorted.map((option) => option.deliveryDays));
  const minDays = Math.min(...sorted.map((option) => option.deliveryDays));
  const between = sorted.filter(
    (option) => option.price > cheapestPrice && option.price < highestPrice,
  );
  const standardSource =
    between.length > 0
      ? closestToRangeCenter(between, cheapestPrice, highestPrice)
      : sorted[0];
  const standard = choice(standardSource, maxDays);

  if (standard.price === highestPrice) return [standard];

  return [standard, choice(sorted[sorted.length - 1], minDays)];
}
