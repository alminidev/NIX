import { maxCartProducts, maxCartQuantity } from "@/lib/cart-calculation";
import type { ICartItem } from "@/types/cart";

/**
 * Valida os itens recebidos do navegador. Devolve null quando o formato é
 * inválido; quantidades repetidas do mesmo produto são somadas.
 */
export function parseCartItems(raw: unknown): ICartItem[] | null {
  if (!Array.isArray(raw) || raw.length > maxCartProducts * 2) return null;

  const quantities = new Map<number, number>();

  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) return null;

    const { productId, quantity } = entry as Record<string, unknown>;

    if (
      typeof productId !== "number" ||
      !Number.isInteger(productId) ||
      productId < 1 ||
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > maxCartQuantity
    ) {
      return null;
    }

    quantities.set(
      productId,
      Math.min((quantities.get(productId) ?? 0) + quantity, maxCartQuantity),
    );
  }

  if (quantities.size > maxCartProducts) return null;

  return [...quantities].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

/** Mantém só os 8 dígitos do CEP, ou devolve null se não forem exatamente 8. */
export function parsePostalCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;

  const digits = raw.replace(/\D/g, "");
  return digits.length === 8 ? digits : null;
}

/** Aplica a máscara 00000-000 enquanto a pessoa digita. */
export function maskPostalCode(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
}
