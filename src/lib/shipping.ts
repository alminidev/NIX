import type { ICartLine, IShippingQuote } from "@/types/cart";

export interface IShippingRequest {
  /** CEP de destino, só dígitos (8) */
  postalCode: string;
  /** Linhas já validadas pelo servidor, com dimensões em cm */
  lines: Pick<ICartLine, "productId" | "sku" | "quantity" | "dimensions">[];
}

/**
 * PONTO DE INTEGRAÇÃO DO FRETE.
 *
 * Hoje devolve uma cotação pendente. A cotação real de valor e prazo pelo
 * Melhor Envio entra aqui, e só aqui: a ação quoteShipping
 * (app/cart/actions.ts) e o resumo do pedido já usam este contrato.
 *
 * TODO: chamar a API de cotação do Melhor Envio com o CEP de destino e as
 * dimensões de cada linha, usando o token lido de variável de ambiente do
 * servidor.
 */
export async function calculateShipping(
  request: IShippingRequest,
): Promise<IShippingQuote> {
  void request;

  return { status: "pending", price: null, deliveryDays: null };
}
