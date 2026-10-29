import { readReceiptUrl } from "@/lib/checkout-url";
import {
  CheckoutLinkError,
  checkPayment,
  checkoutMessages,
  createCheckoutLink,
  parseOrderId,
  PaymentUnavailableError,
  toCents,
  type ICheckoutOrder,
} from "@/lib/infinitepay";
import {
  cancelOrder,
  flagPaymentAmountMismatch,
  markOrderPaid,
  type IPaymentRecord,
} from "@/lib/orders";
import { paidOrderStatuses } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { OrderStatus } from "@/generated/prisma/enums";
import { timingSafeEqual } from "node:crypto";
import "server-only";

export interface IPaymentNotice {
  orderNsu: string;
  transactionNsu: string;
  slug: string;
  receiptUrl: string | null;
}

export interface IConfirmedPayment {
  status: "paid" | "pending" | "review" | "ignored" | "unavailable";
  orderId: number | null;
  orderStatus: OrderStatus | null;
  receiptUrl: string | null;
  stockChanged: boolean;
}

export interface IThankYouState {
  status: "paid" | "pending" | "expired" | "review" | "error";
  orderId: number | null;
  receiptUrl: string | null;
  /** Atualiza sozinha enquanto o pagamento ainda não foi confirmado */
  refresh: boolean;
  stockChanged: boolean;
}

const ignoredPayment: IConfirmedPayment = {
  status: "ignored",
  orderId: null,
  orderStatus: null,
  receiptUrl: null,
  stockChanged: false,
};

function readToken(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 80 || /[\r\n]/.test(trimmed)) return null;
  return trimmed;
}

/** Corpo do webhook. Os valores daqui não provam pagamento. */
export function parseWebhookNotice(body: unknown): IPaymentNotice | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return null;
  }

  const row = body as Record<string, unknown>;
  const orderNsuValue = readToken(row.order_nsu);
  const transactionNsu = readToken(row.transaction_nsu);
  const slug = readToken(row.invoice_slug) ?? readToken(row.slug);
  if (!orderNsuValue || !transactionNsu || !slug) return null;

  return {
    orderNsu: orderNsuValue,
    transactionNsu,
    slug,
    receiptUrl: readReceiptUrl(row.receipt_url),
  };
}

function isSensitiveKey(key: string) {
  const normalized = key.toLowerCase().replace(/-/g, "_");
  return (
    normalized.includes("api_key") ||
    normalized.includes("apikey") ||
    normalized === "authorization" ||
    normalized === "secret" ||
    normalized === "password"
  );
}

function sanitizePayload(body: unknown): Prisma.InputJsonValue {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return {};
  }

  const payload: Record<string, Prisma.InputJsonValue> = {};
  for (const [key, value] of Object.entries(body)) {
    if (isSensitiveKey(key) || value === undefined) continue;
    payload[key] = value as Prisma.InputJsonValue;
  }

  return payload;
}

async function recordPaymentEvent(
  notice: IPaymentNotice,
  result: IConfirmedPayment,
  body: unknown,
) {
  try {
    await prisma.paymentEvent.create({
      data: {
        orderId: result.orderId,
        transactionNsu: notice.transactionNsu,
        type: result.status,
        payload: sanitizePayload(body),
      },
    });
  } catch {
    console.error("Não foi possível registrar o evento de pagamento.");
  }
}

function tokensMatch(received: string, expected: string) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function isAuthorized(request: Request) {
  const secret = process.env.INFINITEPAY_WEBHOOK_SECRET?.trim();
  if (!secret) return false;

  const token = new URL(request.url).searchParams.get("token") ?? "";
  return tokensMatch(token, secret);
}

function toPaymentRecord(
  notice: IPaymentNotice,
  check: {
    amountCents: number;
    paidAmountCents: number | null;
    installments: number | null;
    captureMethod: IPaymentRecord["method"];
  },
): IPaymentRecord {
  return {
    transactionNsu: notice.transactionNsu,
    invoiceSlug: notice.slug,
    method: check.captureMethod,
    amount: check.amountCents / 100,
    paidAmount:
      check.paidAmountCents === null ? null : check.paidAmountCents / 100,
    installments: check.installments,
    receiptUrl: notice.receiptUrl,
    paidAt: new Date(),
  };
}

/**
 * Confere o pagamento no payment_check e só então grava o pedido. O mesmo
 * caminho serve o webhook e a página de obrigado.
 */
export async function confirmPayment(
  notice: IPaymentNotice,
): Promise<IConfirmedPayment> {
  const orderId = parseOrderId(notice.orderNsu);
  if (orderId === null) return ignoredPayment;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      total: true,
      paymentTransactionNsu: true,
      paymentReview: true,
      receiptUrl: true,
    },
  });

  if (!order) return ignoredPayment;

  const settled = paidOrderStatuses.includes(order.status);
  if (order.paymentTransactionNsu || settled) {
    if (order.paymentReview) {
      return {
        status: "review",
        orderId,
        orderStatus: order.status,
        receiptUrl: null,
        stockChanged: false,
      };
    }

    if (settled) {
      return {
        status: "paid",
        orderId,
        orderStatus: order.status,
        receiptUrl: order.receiptUrl,
        stockChanged: false,
      };
    }

    return {
      status: "pending",
      orderId,
      orderStatus: order.status,
      receiptUrl: null,
      stockChanged: false,
    };
  }

  let check;
  try {
    check = await checkPayment({
      orderNsu: notice.orderNsu,
      transactionNsu: notice.transactionNsu,
      slug: notice.slug,
    });
  } catch (error) {
    if (error instanceof PaymentUnavailableError) {
      return {
        status: "unavailable",
        orderId,
        orderStatus: order.status,
        receiptUrl: null,
        stockChanged: false,
      };
    }
    throw error;
  }

  if (!check.paid || check.amountCents === null) {
    return {
      status: "pending",
      orderId,
      orderStatus: order.status,
      receiptUrl: null,
      stockChanged: false,
    };
  }

  const payment = toPaymentRecord(notice, {
    amountCents: check.amountCents,
    paidAmountCents: check.paidAmountCents,
    installments: check.installments,
    captureMethod: check.captureMethod,
  });

  if (check.amountCents !== toCents(Number(order.total))) {
    const flagged = await flagPaymentAmountMismatch(orderId, payment);
    if (flagged.result === "missing") return ignoredPayment;

    const current = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, paymentReview: true },
    });
    if (!current) return ignoredPayment;

    return {
      status: current.paymentReview ? "review" : "paid",
      orderId,
      orderStatus: current.status,
      receiptUrl: null,
      stockChanged: false,
    };
  }

  const marked = await markOrderPaid(orderId, payment);
  if (marked.result === "missing") return ignoredPayment;

  if (marked.result === "review") {
    const reviewed = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    return {
      status: "review",
      orderId,
      orderStatus: reviewed?.status ?? order.status,
      receiptUrl: null,
      stockChanged: false,
    };
  }

  const current = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, receiptUrl: true, paymentReview: true },
  });

  if (!current) return ignoredPayment;

  if (current.paymentReview) {
    return {
      status: "review",
      orderId,
      orderStatus: current.status,
      receiptUrl: null,
      stockChanged: false,
    };
  }

  if (paidOrderStatuses.includes(current.status)) {
    return {
      status: "paid",
      orderId,
      orderStatus: current.status,
      receiptUrl: current.receiptUrl,
      stockChanged: marked.result === "paid" && marked.stockChanged,
    };
  }

  return {
    status: "pending",
    orderId,
    orderStatus: current.status,
    receiptUrl: null,
    stockChanged: false,
  };
}

export async function handleInfinitePayWebhook(request: Request) {
  if (!isAuthorized(request)) {
    return { status: 401 as const, stockChanged: false };
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { status: 400 as const, stockChanged: false };
  }

  const notice = parseWebhookNotice(body);
  if (!notice) return { status: 400 as const, stockChanged: false };

  const result = await confirmPayment(notice);
  await recordPaymentEvent(notice, result, body);

  if (result.status === "unavailable") {
    return { status: 400 as const, stockChanged: false };
  }

  return { status: 200 as const, stockChanged: result.stockChanged };
}

function readParam(
  raw: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = raw[key];
  const text = Array.isArray(value) ? value[0] : value;
  return typeof text === "string" ? text : "";
}

/** Página de obrigado. Os parâmetros da URL não provam pagamento. */
export async function readThankYou(
  raw: Record<string, string | string[] | undefined>,
): Promise<IThankYouState> {
  const notice = parseWebhookNotice({
    order_nsu: readParam(raw, "order_nsu"),
    transaction_nsu: readParam(raw, "transaction_nsu"),
    slug: readParam(raw, "slug"),
    receipt_url: readParam(raw, "receipt_url"),
  });

  if (!notice) {
    return {
      status: "error",
      orderId: null,
      receiptUrl: null,
      refresh: false,
      stockChanged: false,
    };
  }

  const result = await confirmPayment(notice);

  if (result.status === "ignored" || result.status === "unavailable") {
    return {
      status: "error",
      orderId: result.status === "unavailable" ? result.orderId : null,
      receiptUrl: null,
      refresh: false,
      stockChanged: false,
    };
  }

  if (result.status === "paid") {
    return {
      status: "paid",
      orderId: result.orderId,
      receiptUrl: result.receiptUrl,
      refresh: false,
      stockChanged: result.stockChanged,
    };
  }

  if (result.status === "review") {
    return {
      status: "review",
      orderId: result.orderId,
      receiptUrl: null,
      refresh: false,
      stockChanged: false,
    };
  }

  if (result.orderStatus === "EXPIRED" || result.orderStatus === "CANCELLED") {
    return {
      status: result.orderStatus === "EXPIRED" ? "expired" : "error",
      orderId: result.orderId,
      receiptUrl: null,
      refresh: false,
      stockChanged: false,
    };
  }

  return {
    status: "pending",
    orderId: result.orderId,
    receiptUrl: null,
    refresh: true,
    stockChanged: false,
  };
}

async function loadCheckoutOrder(orderId: number): Promise<ICheckoutOrder | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        orderBy: { id: "asc" },
        include: { product: { select: { name: true } } },
      },
    },
  });

  if (!order || order.status !== "AWAITING_PAYMENT") return null;

  return {
    id: order.id,
    total: Number(order.total),
    shipping: order.shipping === null ? null : Number(order.shipping),
    expiresAt: order.expiresAt,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    postalCode: order.postalCode,
    street: order.street,
    number: order.number,
    complement: order.complement,
    neighborhood: order.neighborhood,
    city: order.city,
    state: order.state,
    items: order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
  };
}

/**
 * Gera o link e grava checkoutUrl. Se a InfinitePay falhar, cancela o pedido
 * e devolve o estoque para a pessoa tentar de novo.
 */
export async function startCheckout(orderId: number) {
  try {
    const order = await loadCheckoutOrder(orderId);
    if (!order) {
      return { ok: false as const, message: checkoutMessages.unavailable };
    }

    const checkoutUrl = await createCheckoutLink(order);
    const saved = await prisma.order.updateMany({
      where: { id: orderId, status: "AWAITING_PAYMENT" },
      data: { checkoutUrl },
    });

    if (saved.count !== 1) {
      await cancelOrder(orderId);
      return { ok: false as const, message: checkoutMessages.unavailable };
    }

    return { ok: true as const, checkoutUrl };
  } catch (error) {
    await cancelOrder(orderId);
    console.error("Checkout InfinitePay falhou.");

    return {
      ok: false as const,
      message:
        error instanceof CheckoutLinkError
          ? error.message
          : checkoutMessages.unavailable,
    };
  }
}
