import type { IShippingProviderSetup } from "@/lib/shipping-provider";
import {
  isTimeout,
  readDays,
  readHttpsOrigin,
  readLabel,
  readPostalCode,
  readPrice,
  readServerToken,
  readServiceId,
  shippingMessages,
  shippingTimeoutMs,
  type ICarrierQuote,
  type IShippingRequest,
  type TEnvSource,
} from "@/lib/shipping-shared";
import type { IShippingOption } from "@/types/cart";
import "server-only";

const allowedHosts = new Set([
  "sandbox.melhorenvio.com.br",
  "melhorenvio.com.br",
  "www.melhorenvio.com.br",
]);

const defaultUserAgent = "NIX (contato@nix3d.com.br)";

interface IMelhorEnvioConfig {
  token: string;
  baseUrl: string;
  fromPostalCode: string;
  userAgent: string;
}

function readUserAgent(raw: string | undefined) {
  return raw?.replace(/[\r\n]/g, " ").trim() || defaultUserAgent;
}

export function readMelhorEnvioConfig(env: TEnvSource): IMelhorEnvioConfig | null {
  const token = readServerToken(env.MELHOR_ENVIO_TOKEN);
  const baseUrl = readHttpsOrigin(env.MELHOR_ENVIO_BASE_URL, allowedHosts);
  const fromPostalCode = readPostalCode(env.MELHOR_ENVIO_FROM_POSTAL_CODE);

  if (!token || !baseUrl || !fromPostalCode) return null;

  return {
    token,
    baseUrl,
    fromPostalCode,
    userAgent: readUserAgent(env.MELHOR_ENVIO_USER_AGENT),
  };
}

export function melhorEnvioSetup(
  env: TEnvSource = process.env,
): IShippingProviderSetup {
  const missing: string[] = [];
  if (!readServerToken(env.MELHOR_ENVIO_TOKEN)) missing.push("MELHOR_ENVIO_TOKEN");
  if (!readHttpsOrigin(env.MELHOR_ENVIO_BASE_URL, allowedHosts)) {
    missing.push("MELHOR_ENVIO_BASE_URL");
  }
  if (!readPostalCode(env.MELHOR_ENVIO_FROM_POSTAL_CODE)) {
    missing.push("MELHOR_ENVIO_FROM_POSTAL_CODE");
  }
  return { ready: missing.length === 0, missing };
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

/**
 * Cota no Melhor Envio (POST /api/v2/me/shipment/calculate).
 * Só calcula: a etiqueta não é comprada. Nunca lança e nunca devolve o token.
 */
export async function quoteMelhorEnvio(
  request: IShippingRequest,
): Promise<ICarrierQuote> {
  const config = readMelhorEnvioConfig(process.env);
  if (!config) {
    console.error("Cotação de frete não configurada.");
    return { status: "error", message: shippingMessages.unavailable };
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
      return { status: "error", message: shippingMessages.unavailable };
    }

    body = await response.json();
  } catch (error) {
    console.error(
      isTimeout(error)
        ? "Cotação de frete excedeu o tempo."
        : "Cotação de frete indisponível.",
    );
    return {
      status: "error",
      message: isTimeout(error)
        ? shippingMessages.timeout
        : shippingMessages.unavailable,
    };
  }

  if (!Array.isArray(body)) {
    return { status: "error", message: shippingMessages.unavailable };
  }

  return {
    status: "quoted",
    options: body
      .map(readOption)
      .filter((option): option is IShippingOption => option !== null),
  };
}
