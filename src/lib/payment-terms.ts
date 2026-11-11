/**
 * Condições de pagamento mostradas na loja e usadas no link da InfinitePay.
 *
 * O desconto do Pix é percentual e vale só para os produtos. A API não tem
 * desconto por item: ela aplica `options.discounts.pix` no total do link,
 * e o frete entra nesse total como uma linha. O percentual enviado é o
 * equivalente que tira, em centavos, os mesmos 5% dos produtos.
 */

/** Desconto no Pix, em percentual, só sobre os produtos. */
export const pixDiscountPercent = 5;

/** Parcelas sem juros absorvidas pela loja. */
export const assuredInstallments = 3;

/** Maior parcelamento que o checkout da InfinitePay mostra. */
export const maxCardInstallments = 12;

/** Menor cobrança aceita pela InfinitePay, em centavos. */
export const minimumChargeCents = 100;

const percentScales = [100, 10_000, 1_000_000] as const;

export interface IPixCheckoutDiscount {
  /** null quando o link não deve levar desconto */
  percent: number | null;
  /** Centavos tirados do total do link */
  discountCents: number;
}

export function pixDiscountLabel(percent = pixDiscountPercent) {
  return `${formatPercent(percent)}% de desconto no Pix`;
}

export function cardInstallmentsLabel(installments = assuredInstallments) {
  return `até ${installments}x sem juros no cartão`;
}

export function interestDisclosure(
  from = assuredInstallments + 1,
  to = maxCardInstallments,
) {
  return `De ${from}x a ${to}x há juros da operadora, mostrados no checkout antes do pagamento.`;
}

function formatPercent(percent: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(percent);
}

/** Desconto de Pix sobre os produtos, em centavos. */
export function productPixDiscountCents(
  productCents: number,
  percent = pixDiscountPercent,
) {
  if (percent <= 0 || productCents <= 0) return 0;
  return Math.round((productCents * percent) / 100);
}

/** Centavos que um percentual tira de um total. */
export function linkDiscountCents(totalCents: number, percent: number) {
  if (percent <= 0 || totalCents <= 0) return 0;
  const scale = percentScales[percentScales.length - 1];
  const scaled = Math.round(percent * scale);
  return Math.round((totalCents * scaled) / (scale * 100));
}

/**
 * Percentual de `options.discounts.pix` e o desconto em centavos que ele
 * produz no total. Fica de fora quando o Pix ficaria abaixo de R$ 1,00.
 */
export function pixCheckoutDiscount(
  productCents: number,
  totalCents: number,
  percent = pixDiscountPercent,
): IPixCheckoutDiscount {
  const products = Math.min(Math.max(0, productCents), Math.max(0, totalCents));
  const ideal = productPixDiscountCents(products, percent);
  const none: IPixCheckoutDiscount = { percent: null, discountCents: 0 };

  if (ideal <= 0 || totalCents <= 0 || totalCents - ideal < minimumChargeCents) {
    return none;
  }

  if (products === totalCents) {
    const applied = linkDiscountCents(totalCents, percent);
    if (applied <= 0 || totalCents - applied < minimumChargeCents) return none;
    return { percent, discountCents: applied };
  }

  for (const scale of percentScales) {
    const scaled = Math.round((ideal * 100 * scale) / totalCents);
    if (scaled <= 0 || scaled >= 100 * scale) continue;

    const applied = Math.round((totalCents * scaled) / (scale * 100));
    if (applied === ideal) {
      return { percent: scaled / scale, discountCents: applied };
    }
  }

  const scale = percentScales[percentScales.length - 1];
  const scaled = Math.round((ideal * 100 * scale) / totalCents);
  if (scaled <= 0 || scaled >= 100 * scale) return none;

  const applied = Math.round((totalCents * scaled) / (scale * 100));
  if (applied <= 0 || totalCents - applied < minimumChargeCents) return none;
  return { percent: scaled / scale, discountCents: applied };
}

/**
 * Decide se o `amount` do payment_check fecha com o pedido.
 * No Pix, o valor pode vir cheio ou já com o desconto dos produtos.
 * `paid_amount` menor que o total, na mesma diferença, também conta como
 * desconto aplicado. Cartão não tem esse desconto.
 */
export function resolvePaymentAmount(input: {
  method: "credit_card" | "pix" | null;
  amountCents: number;
  paidAmountCents: number | null;
  totalCents: number;
  discountCents: number;
}): { accepted: boolean; discountCents: number } {
  const { method, amountCents, paidAmountCents, totalCents, discountCents } =
    input;
  const rejected = { accepted: false, discountCents: 0 };

  if (amountCents === totalCents) {
    if (method === "pix" && discountCents > 0 && paidAmountCents !== null) {
      const fromPaid = totalCents - paidAmountCents;
      if (fromPaid > 0 && Math.abs(fromPaid - discountCents) <= 1) {
        return { accepted: true, discountCents: fromPaid };
      }
    }

    return { accepted: true, discountCents: 0 };
  }

  if (method !== "pix" || discountCents <= 0) return rejected;

  const expected = totalCents - discountCents;
  if (
    Math.abs(amountCents - expected) <= 1 &&
    amountCents >= minimumChargeCents
  ) {
    return { accepted: true, discountCents: totalCents - amountCents };
  }

  return rejected;
}
