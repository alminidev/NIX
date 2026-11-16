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
  "api.centraldofrete.com",
  "sandbox.centraldofrete.com",
]);

interface ICentralDoFreteConfig {
  token: string;
  baseUrl: string;
  fromPostalCode: string;
  cargoTypes: number[] | null;
}

function readCargoTypes(raw: string | undefined): number[] | null | "invalid" {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return null;

  const ids: number[] = [];
  for (const part of trimmed.split(",")) {
    const item = part.trim();
    if (!item) continue;
    if (!/^\d+$/.test(item)) return "invalid";
    const id = Number(item);
    if (!Number.isSafeInteger(id) || id <= 0) return "invalid";
    ids.push(id);
  }

  return ids.length > 0 ? ids : null;
}

export function readCentralDoFreteConfig(
  env: TEnvSource,
): ICentralDoFreteConfig | null {
  const token = readServerToken(env.CENTRAL_DO_FRETE_TOKEN);
  const baseUrl = readHttpsOrigin(env.CENTRAL_DO_FRETE_BASE_URL, allowedHosts);
  const fromPostalCode = readPostalCode(env.CENTRAL_DO_FRETE_FROM_POSTAL_CODE);
  const cargoTypes = readCargoTypes(env.CENTRAL_DO_FRETE_CARGO_TYPES);

  if (!token || !baseUrl || !fromPostalCode || cargoTypes === "invalid") {
    return null;
  }

  return { token, baseUrl, fromPostalCode, cargoTypes };
}

export function centralDoFreteSetup(
  env: TEnvSource = process.env,
): IShippingProviderSetup {
  const missing: string[] = [];
  if (!readServerToken(env.CENTRAL_DO_FRETE_TOKEN)) {
    missing.push("CENTRAL_DO_FRETE_TOKEN");
  }
  if (!readHttpsOrigin(env.CENTRAL_DO_FRETE_BASE_URL, allowedHosts)) {
    missing.push("CENTRAL_DO_FRETE_BASE_URL");
  }
  if (!readPostalCode(env.CENTRAL_DO_FRETE_FROM_POSTAL_CODE)) {
    missing.push("CENTRAL_DO_FRETE_FROM_POSTAL_CODE");
  }
  if (readCargoTypes(env.CENTRAL_DO_FRETE_CARGO_TYPES) === "invalid") {
    missing.push("CENTRAL_DO_FRETE_CARGO_TYPES");
  }
  return { ready: missing.length === 0, missing };
}

function invoiceAmount(lines: IShippingRequest["lines"]) {
  let cents = 0;
  for (const line of lines) {
    const unitCents = Math.round(line.unitPrice * 100);
    if (!Number.isFinite(unitCents) || unitCents < 0) return null;
    const lineCents = unitCents * line.quantity;
    if (!Number.isSafeInteger(lineCents)) return null;
    cents += lineCents;
  }

  if (!Number.isSafeInteger(cents) || cents < 0) return null;
  const amount = cents / 100;
  if (amount > 99_999_999.99) return null;
  return amount;
}

function readOption(value: unknown): IShippingOption | null {
  if (typeof value !== "object" || value === null) return null;
  const row = value as Record<string, unknown>;
  const serviceId = readServiceId(row.id);
  const price = readPrice(row.price);
  const deliveryDays = readDays(row.delivery_time);
  if (serviceId === null || price === null || deliveryDays === null) return null;

  const company = readLabel(row.shipping_carrier);
  const name = readLabel(row.service_type) || company;

  return { serviceId, company, name, price, deliveryDays };
}

function readReason(body: unknown) {
  if (typeof body !== "object" || body === null) return "";
  const reason = (body as { reason?: unknown }).reason;
  if (typeof reason !== "string" || !/^[a-z0-9_]{1,40}$/.test(reason)) return "";
  return reason;
}

function messageForReason(reason: string) {
  if (reason === "uncovered_route") return shippingMessages.uncovered;
  return shippingMessages.unavailable;
}

/**
 * Cota na Central do Frete (POST /v1/quotation).
 * O token vai no Authorization sem o prefixo Bearer. Só calcula: não contrata
 * frete, não envia NF-e e não baixa etiqueta. Nunca lança e nunca devolve o token.
 */
export async function quoteCentralDoFrete(
  request: IShippingRequest,
): Promise<ICarrierQuote> {
  const config = readCentralDoFreteConfig(process.env);
  if (!config) {
    console.error("Cotação da Central do Frete não configurada.");
    return { status: "error", message: shippingMessages.unavailable };
  }

  const amount = invoiceAmount(request.lines);
  if (amount === null) {
    return { status: "error", message: shippingMessages.unavailable };
  }

  const payload: {
    from: string;
    to: string;
    invoice_amount: number;
    volumes: Array<{
      quantity: number;
      width: number;
      height: number;
      length: number;
      weight: number;
    }>;
    cargo_types?: number[];
  } = {
    from: config.fromPostalCode,
    to: request.postalCode,
    invoice_amount: amount,
    volumes: request.lines.map((line) => ({
      quantity: line.quantity,
      width: line.dimensions.width,
      height: line.dimensions.height,
      length: line.dimensions.length,
      weight: line.weight,
    })),
  };

  if (config.cargoTypes) payload.cargo_types = config.cargoTypes;

  let body: unknown;

  try {
    const response = await fetch(`${config.baseUrl}/v1/quotation`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(shippingTimeoutMs),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: config.token,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let reason = "";
      try {
        reason = readReason(await response.json());
      } catch {
        reason = "";
      }
      console.error(
        reason
          ? `Cotação da Central do Frete falhou (${response.status}, ${reason}).`
          : `Cotação da Central do Frete falhou (${response.status}).`,
      );
      return { status: "error", message: messageForReason(reason) };
    }

    body = await response.json();
  } catch (error) {
    console.error(
      isTimeout(error)
        ? "Cotação da Central do Frete excedeu o tempo."
        : "Cotação da Central do Frete indisponível.",
    );
    return {
      status: "error",
      message: isTimeout(error)
        ? shippingMessages.timeout
        : shippingMessages.unavailable,
    };
  }

  if (typeof body !== "object" || body === null) {
    return { status: "error", message: shippingMessages.unavailable };
  }

  const prices = (body as { prices?: unknown }).prices;
  if (!Array.isArray(prices)) {
    return { status: "error", message: shippingMessages.unavailable };
  }

  return {
    status: "quoted",
    options: prices
      .map(readOption)
      .filter((option): option is IShippingOption => option !== null),
  };
}
