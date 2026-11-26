import type { ICartItem, ICartLine, ICartSummary } from "@/types/cart";
import type { IProductDimensions } from "@/types/product";
import {
  voltageIssue,
  voltageLabels,
  type TProductVoltage,
} from "@/lib/voltage";

/** Maior quantidade de um mesmo produto por pedido. */
export const maxCartQuantity = 99;

/** Maior número de produtos diferentes no carrinho. */
export const maxCartProducts = 50;

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number): string {
  return currency.format(value);
}

/** Soma em centavos para não acumular erro de ponto flutuante. */
function toCents(value: number) {
  return Math.round(value * 100);
}

export interface ICartProductData {
  id: number;
  sku: string;
  name: string;
  capacity: string;
  image: string;
  dimensions: IProductDimensions;
  /** Peso unitário em kg */
  weight: number;
  price: number;
  stock: number;
  /** Ausente nos testes antigos; tratado como produto sem voltagem. */
  requiresVoltage?: boolean;
}

/**
 * Maior quantidade que se pode comprar do produto: o menor valor entre o
 * estoque cadastrado e o limite por pedido.
 */
export function getMaxQuantity(stock: number): number {
  return Math.max(0, Math.min(Math.floor(stock), maxCartQuantity));
}

export function buildCartLine(
  product: ICartProductData,
  requested: number,
  voltage: TProductVoltage | null = null,
  maxQuantity = getMaxQuantity(product.stock),
): ICartLine | null {
  if (maxQuantity === 0) return null;

  const quantity = Math.min(Math.max(1, requested), maxQuantity);
  const lineTotal = (toCents(product.price) * quantity) / 100;

  return {
    productId: product.id,
    sku: product.sku,
    name: product.name,
    capacity: product.capacity,
    image: product.image,
    dimensions: product.dimensions,
    weight: product.weight,
    unitPrice: product.price,
    formattedUnitPrice: formatCurrency(product.price),
    quantity,
    maxQuantity,
    voltage,
    lineTotal,
    formattedLineTotal: formatCurrency(lineTotal),
  };
}

function lineName(name: string, voltage: TProductVoltage | null) {
  return voltage ? `${name} (${voltageLabels[voltage]})` : name;
}

/** Itens que o navegador pode guardar de novo, sem voltagem quando ela não existe. */
export function toStoredCartItems(lines: ICartLine[]): ICartItem[] {
  return lines.map((line) =>
    line.voltage
      ? {
          productId: line.productId,
          quantity: line.quantity,
          voltage: line.voltage,
        }
      : { productId: line.productId, quantity: line.quantity },
  );
}

/**
 * Monta o resumo a partir dos itens pedidos e dos produtos lidos do banco.
 * Itens sem produto ativo ou sem estoque saem do carrinho e quantidades
 * acima do estoque são reduzidas, sempre com um aviso.
 */
export function summarizeCart(
  items: ICartItem[],
  products: Map<number, ICartProductData & { active: boolean }>,
): ICartSummary {
  const lines: ICartLine[] = [];
  const notices: string[] = [];
  let missing = 0;

  const candidates: {
    product: ICartProductData & { active: boolean };
    voltage: TProductVoltage | null;
    requested: number;
  }[] = [];

  for (const item of items) {
    const product = products.get(item.productId);

    if (!product || !product.active) {
      missing += 1;
      continue;
    }

    const issue = voltageIssue(Boolean(product.requiresVoltage), item.voltage ?? null);

    if (issue === "missing" || issue === "invalid") {
      notices.push(
        `Escolha a voltagem de ${product.name} (110V ou 220V). O item saiu do carrinho.`,
      );
      continue;
    }

    if (issue === "unexpected") {
      notices.push(
        `${product.name} não tem variação de voltagem e saiu do carrinho.`,
      );
      continue;
    }

    candidates.push({
      product,
      voltage: item.voltage ?? null,
      requested: item.quantity,
    });
  }

  const taken = new Map<number, number>();
  const accepted: {
    product: ICartProductData & { active: boolean };
    voltage: TProductVoltage | null;
    requested: number;
    quantity: number;
  }[] = [];

  for (const candidate of candidates) {
    const used = taken.get(candidate.product.id) ?? 0;
    const room = Math.max(
      0,
      getMaxQuantity(candidate.product.stock) - used,
    );
    const label = lineName(candidate.product.name, candidate.voltage);

    if (room === 0) {
      notices.push(`${label} está sem estoque e saiu do carrinho.`);
      continue;
    }

    const quantity = Math.min(candidate.requested, room);
    taken.set(candidate.product.id, used + quantity);

    if (quantity < candidate.requested) {
      notices.push(
        `A quantidade de ${label} foi ajustada para ${quantity}, o máximo disponível.`,
      );
    }

    accepted.push({ ...candidate, quantity });
  }

  for (const row of accepted) {
    const others = (taken.get(row.product.id) ?? 0) - row.quantity;
    const maxQuantity = Math.max(
      0,
      getMaxQuantity(row.product.stock) - others,
    );
    const line = buildCartLine(
      row.product,
      row.quantity,
      row.voltage,
      maxQuantity,
    );

    if (line) lines.push(line);
  }

  if (missing > 0) {
    notices.push(
      missing === 1
        ? "Um produto não está mais disponível e saiu do carrinho."
        : `${missing} produtos não estão mais disponíveis e saíram do carrinho.`,
    );
  }

  const subtotal = calculateSubtotal(lines);

  return {
    lines,
    notices,
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    subtotal,
    formattedSubtotal: formatCurrency(subtotal),
  };
}

/** Soma de preço unitário x quantidade, em reais. */
export function calculateSubtotal(
  entries: { unitPrice: number; quantity: number }[],
): number {
  return (
    entries.reduce(
      (total, entry) => total + toCents(entry.unitPrice) * entry.quantity,
      0,
    ) / 100
  );
}

/** Total do pedido: subtotal mais o frete, quando já houver cotação. */
export function calculateTotal(subtotal: number, shipping: number | null) {
  return (toCents(subtotal) + toCents(shipping ?? 0)) / 100;
}
