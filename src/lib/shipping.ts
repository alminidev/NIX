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
 * Hoje devolve uma cotação pendente. A cotação real de valor e prazo pela
 * Jadlog entra aqui, e só aqui: a ação quoteShipping (app/cart/actions.ts) e
 * o resumo do pedido já usam este contrato.
 *
 * TODO: chamar a API da Jadlog com o CEP de destino e as dimensões de cada
 * linha, usando credenciais lidas de variáveis de ambiente do servidor.
 */
export async function calculateShipping(
  request: IShippingRequest,
): Promise<IShippingQuote> {
  void request;

  return { status: "pending", price: null, deliveryDays: null };
}
