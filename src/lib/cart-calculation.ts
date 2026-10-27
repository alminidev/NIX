import type { ICartItem, ICartLine, ICartSummary } from "@/types/cart";
import type { IProductDimensions } from "@/types/product";

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
  price: number;
  stock: number;
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
): ICartLine | null {
  const maxQuantity = getMaxQuantity(product.stock);
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
    unitPrice: product.price,
    formattedUnitPrice: formatCurrency(product.price),
    quantity,
    maxQuantity,
    lineTotal,
    formattedLineTotal: formatCurrency(lineTotal),
  };
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

  for (const item of items) {
    const product = products.get(item.productId);

    if (!product || !product.active) {
      missing += 1;
      continue;
    }

    const line = buildCartLine(product, item.quantity);

    if (!line) {
      notices.push(`${product.name} está sem estoque e saiu do carrinho.`);
      continue;
    }

    if (line.quantity < item.quantity) {
      notices.push(
        `A quantidade de ${product.name} foi ajustada para ${line.quantity}, o máximo disponível.`,
      );
    }

    lines.push(line);
  }

  if (missing > 0) {
    notices.push(
      missing === 1
        ? "Um produto não está mais disponível e saiu do carrinho."
        : `${missing} produtos não estão mais disponíveis e saíram do carrinho.`,
    );
  }

  const subtotalCents = lines.reduce(
    (total, line) => total + toCents(line.unitPrice) * line.quantity,
    0,
  );
  const subtotal = subtotalCents / 100;

  return {
    lines,
    notices,
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    subtotal,
    formattedSubtotal: formatCurrency(subtotal),
  };
}

/** Total do pedido: subtotal mais o frete, quando já houver cotação. */
export function calculateTotal(subtotal: number, shipping: number | null) {
  return (toCents(subtotal) + toCents(shipping ?? 0)) / 100;
}
