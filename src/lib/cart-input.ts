import { maxCartProducts, maxCartQuantity } from "@/lib/cart-calculation";
import { isProductVoltage, type TProductVoltage } from "@/lib/voltage";
import type { ICartItem } from "@/types/cart";

/**
 * Valida os itens recebidos do navegador. Devolve null quando o formato é
 * inválido. Quantidades da mesma voltagem do mesmo produto são somadas;
 * 110V e 220V permanecem em linhas separadas. Voltagem ausente continua
 * válida aqui — a conferência com o cadastro do produto fica no carrinho
 * e na criação do pedido.
 */
export function parseCartItems(raw: unknown): ICartItem[] | null {
  if (!Array.isArray(raw) || raw.length > maxCartProducts * 2) return null;

  const quantities = new Map<
    string,
    { productId: number; voltage: TProductVoltage | null; quantity: number }
  >();

  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) return null;

    const record = entry as Record<string, unknown>;
    const { productId, quantity } = record;

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

    const rawVoltage = record.voltage;
    if (
      rawVoltage !== undefined &&
      rawVoltage !== null &&
      !isProductVoltage(rawVoltage)
    ) {
      return null;
    }

    const voltage = isProductVoltage(rawVoltage) ? rawVoltage : null;
    const key = `${productId}:${voltage ?? ""}`;
    const current = quantities.get(key);

    quantities.set(key, {
      productId,
      voltage,
      quantity: Math.min((current?.quantity ?? 0) + quantity, maxCartQuantity),
    });
  }

  if (quantities.size > maxCartProducts) return null;

  return [...quantities.values()].map((item) =>
    item.voltage
      ? { productId: item.productId, quantity: item.quantity, voltage: item.voltage }
      : { productId: item.productId, quantity: item.quantity },
  );
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
