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
  /** Peso unitário em kg */
  weight: number;
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

export type TShippingStatus = "pending" | "quoted" | "error";

export interface IShippingOption {
  /** Id do serviço no Melhor Envio */
  serviceId: number;
  /** Nome da transportadora; vazio quando a API não informa */
  company: string;
  /** Nome do serviço (ex.: "PAC") */
  name: string;
  /** Valor em reais */
  price: number;
  /** Prazo em dias úteis */
  deliveryDays: number;
}

export interface IShippingQuote {
  status: TShippingStatus;
  /** Valor do frete em reais; null enquanto não houver cotação */
  price: number | null;
  /** Prazo em dias úteis; null enquanto não houver cotação */
  deliveryDays: number | null;
  /** Mensagem amigável quando status é "error" */
  message: string | null;
  /** Opção escolhida (a intermediária, ou a que a pessoa selecionou) */
  serviceId: number | null;
  company: string | null;
  serviceName: string | null;
  /**
   * Até duas opções, sem nome de transportadora: a de preço intermediário
   * (maior prazo) e, quando existir, a mais cara (menor prazo).
   */
  options: IShippingOption[];
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
