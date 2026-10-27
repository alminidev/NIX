/**
 * Contrato do carrinho. O navegador guarda apenas ICartItem; preços, estoque
 * e totais vêm sempre do servidor (getCartSummary em app/cart/actions.ts).
 */

import type { IProductDimensions } from "@/types/product";

export interface ICartItem {
  productId: number;
  quantity: number;
}

export interface ICartLine {
  productId: number;
  sku: string;
  name: string;
  capacity: string;
  image: string;
  dimensions: IProductDimensions;
  /** Preço unitário em reais */
  unitPrice: number;
  formattedUnitPrice: string;
  /** Quantidade já limitada ao estoque */
  quantity: number;
  /** Maior quantidade que o estoque atual permite */
  maxQuantity: number;
  lineTotal: number;
  formattedLineTotal: string;
}

export interface ICartSummary {
  lines: ICartLine[];
  /** Avisos sobre itens removidos ou com quantidade reduzida */
  notices: string[];
  itemCount: number;
  subtotal: number;
  formattedSubtotal: string;
}

export type TShippingStatus = "pending" | "quoted";

export interface IShippingQuote {
  status: TShippingStatus;
  /** Valor do frete em reais; null enquanto não houver cotação */
  price: number | null;
  /** Prazo em dias úteis; null enquanto não houver cotação */
  deliveryDays: number | null;
}

export interface IShippingResult {
  status: "idle" | "error" | "success";
  message: string;
  quote: IShippingQuote | null;
}

export const shippingInitialState: IShippingResult = {
  status: "idle",
  message: "",
  quote: null,
};
