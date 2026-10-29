import { isInfinitePayCheckoutUrl, readReceiptUrl } from "@/lib/checkout-url";
import "server-only";

/**
 * Cliente do Checkout Integrado da InfinitePay.
 * A chave fica só aqui: nunca vai para o navegador, para um log ou para o banco.
 *
 * A documentação oficial e a Central de Ajuda divergem em alguns campos. Onde
 * isso acontece, o pedido usa o formato mais novo e, se a API recusar o
 * webhook, tenta o formato antigo. O nome do campo da URL na resposta não está
 * nas páginas oficiais; aceitamos `checkout_url` e, em seguida, `url` e `link`.
 */

export const infinitePayTimeoutMs = 8000;

/** Parcelas sem juros absorvidas pela loja. O FAQ promete cartão em até 3x. */
export const assuredInstallments = 3;

const apiOrigin = "https://api.checkout.infinitepay.io";

export const checkoutMessages = {
  unavailable: "Não foi possível abrir o pagamento. Tente novamente.",
  timeout: "O pagamento demorou demais. Tente novamente.",
} as const;

export class CheckoutLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutLinkError";
  }
}

/** payment_check fora do ar, lento ou com resposta inutilizável. O webhook deve tentar de novo. */
export class PaymentUnavailableError extends Error {
  constructor() {
    super("Verificação de pagamento indisponível.");
    this.name = "PaymentUnavailableError";
  }
}

export interface ICheckoutOrderItem {
  name: string;
  quantity: number;
  /** Preço unitário em reais, o do momento do pedido */
  unitPrice: number;
}

export interface ICheckoutOrder {
  id: number;
  total: number;
  shipping: number | null;
  expiresAt: Date | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  postalCode: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  items: ICheckoutOrderItem[];
}

export interface IPaymentCheckInput {
  orderNsu: string;
  transactionNsu: string;
  slug: string;
}

export interface IPaymentCheck {
  paid: boolean;
  /** Centavos de `amount`; null quando o pagamento não foi confirmado */
  amountCents: number | null;
  paidAmountCents: number | null;
  installments: number | null;
  /** `credit_card` ou `pix`; null se a API mandar outro valor */
  captureMethod: "credit_card" | "pix" | null;
}

interface IInfinitePayConfig {
  apiKey: string;
  handle: string;
  orderPrefix: string;
  /** Origem do site (https://loja.com), ou null se a variável não for uma URL */
  siteOrigin: string | null;
  webhookSecret: string | null;
}

export function toCents(value: number) {
  return Math.round(value * 100);
}

export function orderNsu(orderId: number, env: NodeJS.ProcessEnv = process.env) {
  return `${readOrderPrefix(env)}-${orderId}`;
}

/** Id do pedido dentro do order_nsu; null se o prefixo ou o número não baterem. */
export function parseOrderId(
  orderNsuValue: string,
  env: NodeJS.ProcessEnv = process.env,
) {
  const prefix = readOrderPrefix(env);
  const match = new RegExp(`^${escapeRegExp(prefix)}-(\\d+)$`).exec(
    orderNsuValue,
  );
  if (!match) return null;

  const id = Number(match[1]);
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) return null;
  return id;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readOrderPrefix(env: NodeJS.ProcessEnv) {
  const prefix = env.INFINITEPAY_ORDER_PREFIX?.trim() || "nix";
  return /^[A-Za-z0-9_-]{1,20}$/.test(prefix) ? prefix : "nix";
}

function readConfig(env: NodeJS.ProcessEnv): IInfinitePayConfig | null {
  const apiKey = env.INFINITEPAY_API_KEY?.trim() ?? "";
  const handle = (env.INFINITEPAY_HANDLE?.trim() ?? "").replace(/^\$/, "");
  const webhookSecret = env.INFINITEPAY_WEBHOOK_SECRET?.trim() || null;

  if (
    !apiKey ||
    /[\r\n]/.test(apiKey) ||
    !handle ||
    /[\s$]/.test(handle) ||
    (webhookSecret !== null && /[\r\n]/.test(webhookSecret))
  ) {
    return null;
  }

  return {
    apiKey,
    handle,
    orderPrefix: readOrderPrefix(env),
    siteOrigin: readSiteOrigin(env.NEXT_PUBLIC_SITE_URL),
    webhookSecret,
  };
}

function readSiteOrigin(value: string | undefined) {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function isTimeout(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}

function readCheckoutUrl(body: unknown) {
  if (typeof body !== "object" || body === null) return null;
  const row = body as Record<string, unknown>;

  for (const key of ["checkout_url", "url", "link"]) {
    const value = row[key];
    if (typeof value === "string" && isInfinitePayCheckoutUrl(value)) {
      return value;
    }
  }

  return null;
}

function webhookRejected(body: unknown) {
  if (typeof body !== "object" || body === null) return false;
  const message = (body as { message?: unknown }).message;
  return typeof message === "string" && /webhook/i.test(message);
}

async function postInfinitePay(
  path: string,
  apiKey: string,
  payload: unknown,
): Promise<{ ok: boolean; status: number; body: unknown }> {
  let response: Response;

  try {
    response = await fetch(`${apiOrigin}${path}`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(infinitePayTimeoutMs),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (isTimeout(error)) {
      throw new CheckoutLinkError(checkoutMessages.timeout);
    }
    throw new CheckoutLinkError(checkoutMessages.unavailable);
  }

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  return { ok: response.ok, status: response.status, body };
}

function buildLinkPayload(order: ICheckoutOrder, config: IInfinitePayConfig) {
  const items = order.items.map((item) => ({
    quantity: item.quantity,
    price: toCents(item.unitPrice),
    description: item.name.replace(/[\r\n]+/g, " ").trim().slice(0, 120),
  }));

  const shippingCents = toCents(order.shipping ?? 0);
  if (shippingCents > 0) {
    items.push({ quantity: 1, price: shippingCents, description: "Frete" });
  }

  const sum = items.reduce((total, item) => total + item.price * item.quantity, 0);
  if (sum !== toCents(order.total) || items.length === 0) {
    throw new CheckoutLinkError(checkoutMessages.unavailable);
  }

  const phone = order.customerPhone.replace(/\D/g, "");
  const webhookUrl = readWebhookUrl(config);

  return {
    handle: config.handle,
    items,
    order_nsu: `${config.orderPrefix}-${order.id}`,
    ...(config.siteOrigin
      ? { redirect_url: `${config.siteOrigin}/pedido/obrigado` }
      : {}),
    ...(webhookUrl
      ? { webhook: { url: webhookUrl, events: ["paid"] } }
      : {}),
    customer: {
      name: order.customerName.trim().slice(0, 120),
      email: order.customerEmail.trim(),
      phone_number: `+55${phone}`,
    },
    address: {
      cep: order.postalCode,
      street: order.street,
      number: order.number,
      neighborhood: order.neighborhood,
      ...(order.complement ? { complement: order.complement } : {}),
      city: order.city,
      state: order.state,
    },
    options: {
      assured_installments: assuredInstallments,
      single_payment: true,
      payment_methods_enabled: ["pix", "credit_card"],
      ...(order.expiresAt
        ? { valid_until: order.expiresAt.toISOString() }
        : {}),
    },
  };
}

/**
 * Webhook só em HTTPS. Em desenvolvimento (http://localhost) ele fica de fora
 * e a página de obrigado confirma o pagamento.
 */
function readWebhookUrl(config: IInfinitePayConfig) {
  if (!config.siteOrigin?.startsWith("https://") || !config.webhookSecret) {
    return null;
  }

  const url = new URL("/api/payments/infinitepay/webhook", config.siteOrigin);
  url.searchParams.set("token", config.webhookSecret);
  return url.toString();
}

/**
 * Cria o link de checkout do pedido. O preço vem do pedido já gravado.
 * Lança CheckoutLinkError com uma mensagem que pode ir para o cliente.
 */
export async function createCheckoutLink(
  order: ICheckoutOrder,
  env: NodeJS.ProcessEnv = process.env,
) {
  const config = readConfig(env);
  if (!config) {
    console.error("Checkout InfinitePay não configurado.");
    throw new CheckoutLinkError(checkoutMessages.unavailable);
  }

  const payload = buildLinkPayload(order, config);
  let result: Awaited<ReturnType<typeof postInfinitePay>>;

  try {
    result = await postInfinitePay("/links", config.apiKey, payload);
  } catch (error) {
    if (error instanceof CheckoutLinkError) {
      console.error(
        error.message === checkoutMessages.timeout
          ? "Checkout InfinitePay excedeu o tempo."
          : "Checkout InfinitePay indisponível.",
      );
    }
    throw error;
  }

  const rejectedWebhook =
    "webhook" in payload ? payload.webhook : undefined;

  if (result.status === 400 && rejectedWebhook && webhookRejected(result.body)) {
    const { webhook: _webhook, ...withoutWebhook } = payload;
    try {
      result = await postInfinitePay("/links", config.apiKey, {
        ...withoutWebhook,
        webhook_url: rejectedWebhook.url,
      });
    } catch (error) {
      if (error instanceof CheckoutLinkError) {
        console.error("Checkout InfinitePay indisponível.");
      }
      throw error;
    }
  }

  if (!result.ok) {
    console.error(`Checkout InfinitePay falhou (${result.status}).`);
    throw new CheckoutLinkError(checkoutMessages.unavailable);
  }

  const checkoutUrl = readCheckoutUrl(result.body);
  if (!checkoutUrl) {
    console.error("Checkout InfinitePay respondeu sem URL.");
    throw new CheckoutLinkError(checkoutMessages.unavailable);
  }

  return checkoutUrl;
}

function readCents(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < 0 || value > 99_999_999_99) return null;
  return value;
}

function readInstallments(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < 1 || value > 24) return null;
  return value;
}

function readCaptureMethod(value: unknown): IPaymentCheck["captureMethod"] {
  if (value === "credit_card" || value === "pix") return value;
  return null;
}

function readPaymentCheck(body: unknown): IPaymentCheck | null {
  if (typeof body !== "object" || body === null) return null;
  const row = body as Record<string, unknown>;

  if (row.success !== true || row.paid !== true) {
    return {
      paid: false,
      amountCents: null,
      paidAmountCents: null,
      installments: null,
      captureMethod: null,
    };
  }

  const amountCents = readCents(row.amount);
  if (amountCents === null) return null;

  return {
    paid: true,
    amountCents,
    paidAmountCents: readCents(row.paid_amount),
    installments: readInstallments(row.installments),
    captureMethod: readCaptureMethod(row.capture_method),
  };
}

/**
 * Confere o pagamento na InfinitePay. Não usa o corpo do webhook nem a URL
 * de retorno como prova. Lança PaymentUnavailableError quando vale a pena
 * tentar de novo (rede, timeout, 5xx ou resposta paga sem valor).
 */
export async function checkPayment(
  input: IPaymentCheckInput,
  env: NodeJS.ProcessEnv = process.env,
): Promise<IPaymentCheck> {
  const config = readConfig(env);
  if (!config) {
    console.error("Verificação InfinitePay não configurada.");
    throw new PaymentUnavailableError();
  }

  let result: Awaited<ReturnType<typeof postInfinitePay>>;

  try {
    result = await postInfinitePay("/payment_check", config.apiKey, {
      handle: config.handle,
      order_nsu: input.orderNsu,
      transaction_nsu: input.transactionNsu,
      slug: input.slug,
    });
  } catch (error) {
    console.error(
      error instanceof CheckoutLinkError &&
        error.message === checkoutMessages.timeout
        ? "Verificação InfinitePay excedeu o tempo."
        : "Verificação InfinitePay indisponível.",
    );
    throw new PaymentUnavailableError();
  }

  if (result.status >= 500) {
    console.error(`Verificação InfinitePay falhou (${result.status}).`);
    throw new PaymentUnavailableError();
  }

  if (!result.ok) {
    console.error(`Verificação InfinitePay recusou (${result.status}).`);
    return {
      paid: false,
      amountCents: null,
      paidAmountCents: null,
      installments: null,
      captureMethod: null,
    };
  }

  const payment = readPaymentCheck(result.body);
  if (!payment) {
    console.error("Verificação InfinitePay respondeu sem valor.");
    throw new PaymentUnavailableError();
  }

  return payment;
}

export { readReceiptUrl };
