"use server";

import { resolveCart } from "@/lib/cart";
import { parseCartItems, parsePostalCode } from "@/lib/cart-input";
import { calculateShipping } from "@/lib/shipping";
import type { ICartSummary, IShippingResult } from "@/types/cart";

/**
 * Valida os itens do carrinho no servidor e devolve preços, estoque e
 * totais. Devolve null quando a entrada é inválida.
 */
export async function getCartSummary(
  rawItems: unknown,
): Promise<ICartSummary | null> {
  const items = parseCartItems(rawItems);
  if (!items) return null;

  return resolveCart(items);
}

/**
 * Cotação de frete para o CEP informado. O cálculo fica em lib/shipping.ts.
 */
export async function quoteShipping(
  rawPostalCode: unknown,
  rawItems: unknown,
): Promise<IShippingResult> {
  const postalCode = parsePostalCode(rawPostalCode);

  if (!postalCode) {
    return {
      status: "error",
      message: "Informe um CEP com 8 dígitos.",
      quote: null,
    };
  }

  const items = parseCartItems(rawItems);

  if (!items) {
    return {
      status: "error",
      message: "Não foi possível ler o carrinho.",
      quote: null,
    };
  }

  const summary = await resolveCart(items);

  if (summary.lines.length === 0) {
    return {
      status: "error",
      message: "Adicione um produto ao carrinho para calcular o frete.",
      quote: null,
    };
  }

  const quote = await calculateShipping({ postalCode, lines: summary.lines });

  if (quote.status === "pending") {
    return {
      status: "success",
      message:
        "CEP recebido. O valor e o prazo do frete serão informados em breve.",
      quote,
    };
  }

  return { status: "success", message: "", quote };
}
