import type { IShippingOption, IShippingQuote } from "@/types/cart";
import "server-only";

/** Recorte de process.env. Não exige NODE_ENV, para o teste passar um objeto pequeno. */
export type TEnvSource = {
  readonly [key: string]: string | undefined;
};

export interface IShippingRequest {
  /** CEP de destino, só dígitos (8) */
  postalCode: string;
  /** Linhas já validadas pelo servidor, com dimensões em cm, peso em kg e preço */
  lines: Array<{
    productId: number;
    sku: string;
    quantity: number;
    dimensions: { width: number; height: number; length: number };
    weight: number;
    unitPrice: number;
  }>;
  /**
   * Opção escolhida no carrinho, entre as entregas já filtradas. Se ela
   * ainda existir na cotação nova, ela é a usada. Sem `strictService`, um
   * id que sumiu cai na intermediária. Com `strictService` (o checkout),
   * um id fora das opções filtradas devolve erro e o pedido não é criado.
   * O preço nunca vem do navegador. A retirada no local não passa por aqui.
   */
  serviceId?: number | null;
  /** Recusa um serviceId ausente nas opções filtradas, em vez de substituí-lo. */
  strictService?: boolean;
}

export const shippingTimeoutMs = 8000;

export const shippingMessages = {
  unavailable:
    "Não foi possível cotar o frete agora. Tente novamente em instantes.",
  timeout: "A cotação de frete demorou demais. Tente novamente.",
  uncovered: "Não há entrega disponível para este CEP.",
  missingPackage:
    "Não foi possível cotar o frete porque um produto está sem peso ou sem medidas.",
  optionsChanged:
    "As opções de frete mudaram. Calcule o frete de novo e escolha uma opção.",
  chooseOption: "Escolha uma opção de frete.",
} as const;

export type ICarrierQuote =
  | { status: "quoted"; options: IShippingOption[] }
  | { status: "error"; message: string };

export function errorQuote(message: string): IShippingQuote {
  return {
    status: "error",
    price: null,
    deliveryDays: null,
    message,
    serviceId: null,
    company: null,
    serviceName: null,
    options: [],
  };
}

export function readHttpsOrigin(
  raw: string | undefined,
  allowedHosts: ReadonlySet<string>,
) {
  try {
    const url = new URL(raw ?? "");
    if (
      url.protocol === "https:" &&
      allowedHosts.has(url.hostname.toLowerCase())
    ) {
      return url.origin;
    }
  } catch {
    return "";
  }

  return "";
}

/** Token de servidor. Rejeita vazio e quebra de linha. Não registra o valor. */
export function readServerToken(raw: string | undefined) {
  const token = raw?.trim() ?? "";
  if (!token || /[\r\n]/.test(raw ?? "")) return "";
  return token;
}

export function readPostalCode(raw: string | undefined) {
  const digits = (raw ?? "").replace(/\D/g, "");
  return digits.length === 8 ? digits : "";
}

export function readPrice(value: unknown) {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+(\.\d+)?$/.test(value)
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numeric) || numeric < 0 || numeric > 99_999_999.99) {
    return null;
  }

  return Math.round(numeric * 100) / 100;
}

export function readDays(value: unknown) {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(numeric) || numeric < 0 || numeric > 365) return null;
  return numeric;
}

/** Id de serviço da cotação. 0 fica reservado para a retirada no local. */
export function readServiceId(value: unknown) {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(numeric) || numeric <= 0) return null;
  return numeric;
}

export function readLabel(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 80);
}

export function lineCanShip(line: IShippingRequest["lines"][number]) {
  return (
    line.quantity > 0 &&
    line.weight > 0 &&
    line.dimensions.width > 0 &&
    line.dimensions.height > 0 &&
    line.dimensions.length > 0 &&
    line.unitPrice >= 0
  );
}

export function isTimeout(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}
