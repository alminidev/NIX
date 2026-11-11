import { presentShippingChoices } from "@/lib/shipping-display";
import type { ICartLine, IShippingOption, IShippingQuote } from "@/types/cart";
import "server-only";

export interface IShippingRequest {
  /** CEP de destino, só dígitos (8) */
  postalCode: string;
  /** Linhas já validadas pelo servidor, com dimensões em cm, peso em kg e preço */
  lines: Pick<
    ICartLine,
    "productId" | "sku" | "quantity" | "dimensions" | "weight" | "unitPrice"
  >[];
  /**
   * Opção escolhida no carrinho (a intermediária ou a mais cara). Se ela
   * ainda existir na cotação nova, ela é a usada; senão vale a intermediária.
   * O preço nunca vem do navegador.
   */
  serviceId?: number | null;
}

export const shippingTimeoutMs = 8000;

export const shippingMessages = {
  unavailable:
    "Não foi possível cotar o frete agora. Tente novamente em instantes.",
  timeout: "A cotação de frete demorou demais. Tente novamente.",
  uncovered: "Não há entrega disponível para este CEP.",
  missingPackage:
    "Não foi possível cotar o frete porque um produto está sem peso ou sem medidas.",
} as const;

const allowedHosts = new Set([
  "sandbox.melhorenvio.com.br",
  "melhorenvio.com.br",
  "www.melhorenvio.com.br",
]);

const defaultUserAgent = "NIX (contato@nix3d.com.br)";

interface IShippingConfig {
  token: string;
  baseUrl: string;
  fromPostalCode: string;
  userAgent: string;
}

function errorQuote(message: string): IShippingQuote {
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

function readConfig(env: NodeJS.ProcessEnv): IShippingConfig | null {
  const token = env.MELHOR_ENVIO_TOKEN?.trim() ?? "";
  const userAgent =
    env.MELHOR_ENVIO_USER_AGENT?.replace(/[\r\n]/g, " ").trim() ||
    defaultUserAgent;
  const fromPostalCode = (env.MELHOR_ENVIO_FROM_POSTAL_CODE ?? "").replace(
    /\D/g,
    "",
  );

  let baseUrl = "";
  try {
    const url = new URL(env.MELHOR_ENVIO_BASE_URL ?? "");
    if (
      url.protocol === "https:" &&
      allowedHosts.has(url.hostname.toLowerCase())
    ) {
      baseUrl = url.origin;
    }
  } catch {
    baseUrl = "";
  }

  if (!token || /[\r\n]/.test(token) || fromPostalCode.length !== 8 || !baseUrl) {
    return null;
  }

  return { token, baseUrl, fromPostalCode, userAgent };
}

function readPrice(value: unknown) {
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

function readDays(value: unknown) {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(numeric) || numeric < 0 || numeric > 365) return null;
  return numeric;
}

function readServiceId(value: unknown) {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(numeric) || numeric <= 0) return null;
  return numeric;
}

function readLabel(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 80);
}

function hasCarrierError(error: unknown) {
  if (error == null || error === false) return false;
  if (typeof error === "string") return error.trim().length > 0;
  return true;
}

function readOption(value: unknown): IShippingOption | null {
  if (typeof value !== "object" || value === null) return null;
  const row = value as Record<string, unknown>;
  if (hasCarrierError(row.error)) return null;

  const serviceId = readServiceId(row.id);
  const name = readLabel(row.name);
  const price = readPrice(row.custom_price) ?? readPrice(row.price);
  const deliveryDays =
    readDays(row.custom_delivery_time) ?? readDays(row.delivery_time);
  if (serviceId === null || !name || price === null || deliveryDays === null) {
    return null;
  }

  let company = "";
  if (typeof row.company === "object" && row.company !== null) {
    company = readLabel((row.company as { name?: unknown }).name);
  }

  return { serviceId, company, name, price, deliveryDays };
}

function lineCanShip(line: IShippingRequest["lines"][number]) {
  return (
    line.quantity > 0 &&
    line.weight > 0 &&
    line.dimensions.width > 0 &&
    line.dimensions.height > 0 &&
    line.dimensions.length > 0 &&
    line.unitPrice >= 0
  );
}

function isTimeout(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}

/**
 * Cota o frete no Melhor Envio (POST /api/v2/me/shipment/calculate).
 * Só calcula: a etiqueta não é comprada e a entrega é feita por fora.
 * Nunca lança e nunca devolve o token. Opções com erro são ignoradas.
 * A pessoa vê a opção de preço intermediário (padrão, maior prazo) e a mais
 * cara (menor prazo).
 */
export async function calculateShipping(
  request: IShippingRequest,
): Promise<IShippingQuote> {
  if (request.lines.length === 0) {
    return errorQuote(shippingMessages.unavailable);
  }

  if (request.lines.some((line) => !lineCanShip(line))) {
    return errorQuote(shippingMessages.missingPackage);
  }

  const config = readConfig(process.env);
  if (!config) {
    console.error("Cotação de frete não configurada.");
    return errorQuote(shippingMessages.unavailable);
  }

  const payload = {
    from: { postal_code: config.fromPostalCode },
    to: { postal_code: request.postalCode },
    products: request.lines.map((line) => ({
      id: line.sku,
      width: line.dimensions.width,
      height: line.dimensions.height,
      length: line.dimensions.length,
      weight: line.weight,
      insurance_value: Math.round(line.unitPrice * 100) / 100,
      quantity: line.quantity,
    })),
    options: { receipt: false, own_hand: false },
  };

  let body: unknown;

  try {
    const response = await fetch(
      `${config.baseUrl}/api/v2/me/shipment/calculate`,
      {
        method: "POST",
        cache: "no-store",
        signal: AbortSignal.timeout(shippingTimeoutMs),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
          "User-Agent": config.userAgent,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      console.error(`Cotação de frete falhou (${response.status}).`);
      return errorQuote(shippingMessages.unavailable);
    }

    body = await response.json();
  } catch (error) {
    console.error(
      isTimeout(error)
        ? "Cotação de frete excedeu o tempo."
        : "Cotação de frete indisponível.",
    );
    return errorQuote(
      isTimeout(error) ? shippingMessages.timeout : shippingMessages.unavailable,
    );
  }

  if (!Array.isArray(body)) return errorQuote(shippingMessages.unavailable);

  const quoted = body
    .map(readOption)
    .filter((option): option is IShippingOption => option !== null);

  const options = presentShippingChoices(quoted);

  if (options.length === 0) return errorQuote(shippingMessages.uncovered);

  const picked =
    options.find((option) => option.serviceId === request.serviceId) ??
    options[0];

  return {
    status: "quoted",
    price: picked.price,
    deliveryDays: picked.deliveryDays,
    message: null,
    serviceId: picked.serviceId,
    company: null,
    serviceName: null,
    options,
  };
}
