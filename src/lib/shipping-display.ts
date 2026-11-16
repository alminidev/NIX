import { formatCurrency } from "@/lib/cart-calculation";
import type { IShippingOption, IShippingQuote } from "@/types/cart";

/** Id reservado: não existe na cotação. O preço é sempre zero. */
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

/** Id da opção escolhida no formulário. 0 é a retirada no local. */
export function readShippingServiceId(formData: FormData) {
  const raw = formData.get("shippingServiceId");
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return id >= 0 ? id : null;
}

/** "Grátis" quando o frete é zero, para não parecer um valor somado ao pedido. */
export function formatShippingAmount(price: number) {
  return price === 0 ? "Grátis" : formatCurrency(price);
}

/**
 * Cotação só da retirada no local. O valor não vem do navegador nem do
 * provedor de frete: a retirada é sempre grátis.
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
 * Uma cotação por prazo: a mais cara. Empate de preço fica com o menor
 * serviceId. A ordem dos prazos não importa; quem chama ordena de novo.
 */
function onePricePerDeadline(options: IShippingOption[]) {
  const byDeadline = new Map<number, IShippingOption>();

  for (const option of options) {
    const current = byDeadline.get(option.deliveryDays);
    const samePrice =
      current !== undefined && cents(option.price) === cents(current.price);
    if (
      !current ||
      cents(option.price) > cents(current.price) ||
      (samePrice && option.serviceId < current.serviceId)
    ) {
      byDeadline.set(option.deliveryDays, option);
    }
  }

  return [...byDeadline.values()];
}

/**
 * Opções que a pessoa escolhe no checkout.
 *
 * Antes de escolher, cada prazo fica com uma só cotação: a mais cara
 * (empate de preço fica com o menor serviceId). Em seguida vale a regra
 * de sempre: a intermediária mais próxima do centro de preço, rotulada
 * com o maior prazo, e a mais cara, rotulada com o menor prazo. No máximo
 * duas entregas. A cotação só define valor e prazo — o nome da
 * transportadora não aparece.
 *
 * Se as duas saírem com o mesmo prazo, fica só a mais cara. Se todas as
 * cotações tiverem o mesmo prazo, só a mais cara aparece. Com uma única
 * cotação, só ela aparece. Com duas, a mais barata faz o papel da
 * intermediária. A retirada no local não entra aqui: ela é acrescentada
 * depois, no fim.
 */
export function presentShippingChoices(
  options: IShippingOption[],
): IShippingOption[] {
  const distinct = onePricePerDeadline(options);
  if (distinct.length === 0) return [];

  const sorted = [...distinct].sort(byPrice);
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

  const express = choice(sorted[sorted.length - 1], minDays);
  if (standard.deliveryDays === express.deliveryDays) return [express];

  return [standard, express];
}
