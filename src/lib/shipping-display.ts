import type { IShippingOption } from "@/types/cart";

/** Texto do prazo para a pessoa (ex.: "7 dias úteis"). */
export function formatDeliveryDays(days: number) {
  if (days === 0) return "No mesmo dia";
  if (days === 1) return "1 dia útil";
  return `${days} dias úteis`;
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
