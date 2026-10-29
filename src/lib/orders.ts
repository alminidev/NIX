import { InsufficientStockError } from "@/app/_errors/insufficient-stock.error";
import { AppError } from "@/app/_errors/app.error";
import { calculateSubtotal, calculateTotal } from "@/lib/cart-calculation";
import { calculateExpiresAt } from "@/lib/order-expiration";
import { getPreviousOrderStatuses, paidOrderStatuses } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";
import type { IOrderCreated, IOrderInput } from "@/types/order";
import "server-only";

/**
 * Cria o pedido a partir do carrinho, numa única transação:
 *
 * 1. baixa o estoque de cada produto com um UPDATE condicional
 *    (stock >= quantidade), que é atômico no banco. Duas compras ao mesmo
 *    tempo nunca deixam o estoque negativo: a que perder falha;
 * 2. lê o preço atual de cada produto e o congela no item do pedido;
 * 3. grava o pedido com o subtotal, o frete, o total e o prazo para pagar
 *    (expiresAt); passado o prazo sem pagamento, o pedido expira e o estoque
 *    volta (veja expireOverdueOrders).
 *
 * Se qualquer produto não tiver estoque, nada é gravado e o erro explica qual.
 */
export async function createOrder(input: IOrderInput): Promise<IOrderCreated> {
  // Ordem fixa por produto: evita deadlock entre pedidos simultâneos.
  const items = [...input.items].sort((a, b) => a.productId - b.productId);

  const expiresAt = calculateExpiresAt(new Date());

  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const reserved = await tx.product.updateMany({
        where: {
          id: item.productId,
          active: true,
          stock: { gte: item.quantity },
        },
        data: { stock: { decrement: item.quantity } },
      });

      if (reserved.count === 1) continue;

      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { name: true, stock: true, active: true },
      });

      if (!product || !product.active) {
        throw new AppError(
          "Um produto do carrinho não está mais disponível.",
          409,
        );
      }

      throw new InsufficientStockError(product.name, product.stock);
    }

    const products = await tx.product.findMany({
      where: { id: { in: items.map((item) => item.productId) } },
      select: { id: true, price: true },
    });
    const prices = new Map(
      products.map((product) => [product.id, product.price]),
    );
    const orderItems = items.flatMap((item) => {
      const unitPrice = prices.get(item.productId);
      return unitPrice
        ? [{ productId: item.productId, quantity: item.quantity, unitPrice }]
        : [];
    });

    const subtotal = calculateSubtotal(
      orderItems.map((item) => ({
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
      })),
    );
    const total = calculateTotal(subtotal, input.shipping);

    const order = await tx.order.create({
      data: {
        expiresAt,
        source: input.source ?? "SITE",
        subtotal,
        shipping: input.shipping,
        shippingService:
          input.shipping === null || !input.shippingService
            ? null
            : input.shippingService,
        deliveryDays:
          input.shipping === null ? null : (input.deliveryDays ?? null),
        total,
        customerName: input.customer.name,
        customerEmail: input.customer.email,
        customerPhone: input.customer.phone,
        postalCode: input.address.postalCode,
        street: input.address.street,
        number: input.address.number,
        complement: input.address.complement || null,
        neighborhood: input.address.neighborhood,
        city: input.address.city,
        state: input.address.state,
        items: { create: orderItems },
      },
      select: { id: true },
    });

    return {
      id: order.id,
      subtotal,
      shipping: input.shipping,
      total,
      expiresAt,
    };
  });
}

/**
 * Tira o pedido de "aguardando pagamento" (ou de "pago", no cancelamento) e
 * devolve o estoque, tudo numa transação. A troca de status é condicional
 * (updateMany por status): só quem de fato mudou o pedido devolve o estoque,
 * então chamadas repetidas ou simultâneas nunca devolvem duas vezes.
 *
 * Devolve false quando o pedido não existe ou já saiu dos status permitidos.
 */
async function releaseOrder(
  orderId: number,
  status: "CANCELLED" | "EXPIRED",
  from: OrderStatus[],
  now?: Date,
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const released = await tx.order.updateMany({
      where: {
        id: orderId,
        status: { in: from },
        ...(now ? { expiresAt: { lte: now } } : {}),
      },
      data: { status },
    });

    if (released.count === 0) return false;

    const items = await tx.orderItem.findMany({
      where: { orderId },
      select: { productId: true, quantity: true },
      orderBy: { productId: "asc" },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return true;
  });
}

/**
 * Cancela o pedido e devolve o estoque. Só vale enquanto o pedido ainda não
 * entrou em produção: aguardando pagamento ou pago.
 */
export function cancelOrder(orderId: number): Promise<boolean> {
  return releaseOrder(orderId, "CANCELLED", ["AWAITING_PAYMENT", "PAID"]);
}

/**
 * Expira um pedido que passou do prazo sem pagamento e devolve o estoque.
 * Um pedido pago ou cancelado no meio do caminho não é tocado.
 */
export function expireOrder(
  orderId: number,
  now: Date = new Date(),
): Promise<boolean> {
  return releaseOrder(orderId, "EXPIRED", ["AWAITING_PAYMENT"], now);
}

/**
 * Expira todos os pedidos aguardando pagamento cujo prazo passou. Roda ao
 * criar um pedido e pela rota de cron (app/api/orders/expire/route.ts).
 * Devolve quantos pedidos expiraram; quem chama invalida o cache "products".
 */
export async function expireOverdueOrders(
  now: Date = new Date(),
): Promise<number> {
  const overdue = await prisma.order.findMany({
    where: { status: "AWAITING_PAYMENT", expiresAt: { lte: now } },
    select: { id: true },
    orderBy: { id: "asc" },
  });

  let expired = 0;
  for (const order of overdue) {
    if (await expireOrder(order.id, now)) expired += 1;
  }

  return expired;
}

export type TOrderStatusChange = "changed" | "not-allowed" | "not-found";

/**
 * Muda o status do pedido à mão (painel). Só vale uma mudança permitida em
 * canChangeOrderStatus (lib/order-status.ts), conferida no próprio UPDATE
 * condicional: quem perder uma corrida, ou clicar de novo, recebe
 * "not-allowed" e nada muda. Cancelar passa por cancelOrder, que devolve o
 * estoque. O código de rastreio só é gravado ao enviar.
 */
export async function changeOrderStatus(
  orderId: number,
  to: OrderStatus,
  trackingCode: string | null = null,
): Promise<TOrderStatusChange> {
  let changed = false;

  if (to === "CANCELLED") {
    changed = await cancelOrder(orderId);
  } else if (to !== "EXPIRED") {
    const result = await prisma.order.updateMany({
      where: { id: orderId, status: { in: getPreviousOrderStatuses(to) } },
      data: {
        status: to,
        ...(to === "SHIPPED" ? { trackingCode } : {}),
      },
    });
    changed = result.count === 1;
  }

  if (changed) return "changed";

  const exists = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  });

  return exists ? "not-allowed" : "not-found";
}

/** Motivos gravados em paymentReviewReason. O painel mostra o texto. */
export const paymentReviewReasons = {
  amount: "valor do pagamento diferente do total do pedido",
  expiredStock: "pago após expirar, sem estoque",
  cancelled: "pago em pedido cancelado",
} as const;

/** Dados já conferidos no payment_check. Valores em reais. */
export interface IPaymentRecord {
  transactionNsu: string;
  invoiceSlug: string;
  method: "credit_card" | "pix" | null;
  amount: number;
  paidAmount: number | null;
  installments: number | null;
  receiptUrl: string | null;
  paidAt: Date;
}

export type TMarkOrderPaid =
  | { result: "paid"; stockChanged: boolean }
  | { result: "already" }
  | { result: "review"; reason: string }
  | { result: "missing" };

function paymentData(payment: IPaymentRecord) {
  return {
    paymentMethod: payment.method,
    paymentTransactionNsu: payment.transactionNsu,
    paymentInvoiceSlug: payment.invoiceSlug,
    paymentAmount: payment.amount,
    paidAmount: payment.paidAmount,
    paymentInstallments: payment.installments,
    receiptUrl: payment.receiptUrl,
    paidAt: payment.paidAt,
  };
}

function isUniqueConstraint(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

class StockShortError extends Error {
  constructor() {
    super("Sem estoque para reativar o pedido.");
    this.name = "StockShortError";
  }
}

class AlreadyChangedError extends Error {
  constructor() {
    super("O pedido mudou durante a confirmação.");
    this.name = "AlreadyChangedError";
  }
}

async function classifyPayment(
  orderId: number,
  payment: IPaymentRecord,
): Promise<TMarkOrderPaid> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      paymentTransactionNsu: true,
      paymentReview: true,
      paymentReviewReason: true,
    },
  });

  if (!order) return { result: "missing" };

  if (order.paymentReview) {
    return {
      result: "review",
      reason: order.paymentReviewReason ?? paymentReviewReasons.amount,
    };
  }

  if (
    order.paymentTransactionNsu === payment.transactionNsu ||
    paidOrderStatuses.includes(order.status)
  ) {
    return { result: "already" };
  }

  return { result: "already" };
}

/**
 * Grava um pagamento conferido que não pode virar PAID (valor diferente do
 * pedido). Não mexe no status nem no estoque.
 */
export async function flagPaymentAmountMismatch(
  orderId: number,
  payment: IPaymentRecord,
): Promise<TMarkOrderPaid> {
  try {
    const updated = await prisma.order.updateMany({
      where: {
        id: orderId,
        paymentTransactionNsu: null,
        status: { in: ["AWAITING_PAYMENT", "EXPIRED", "CANCELLED"] },
      },
      data: {
        ...paymentData(payment),
        paymentReview: true,
        paymentReviewReason: paymentReviewReasons.amount,
      },
    });

    if (updated.count === 1) {
      return { result: "review", reason: paymentReviewReasons.amount };
    }
  } catch (error) {
    if (!isUniqueConstraint(error)) throw error;
  }

  return classifyPayment(orderId, payment);
}

async function flagExpiredWithoutStock(
  orderId: number,
  payment: IPaymentRecord,
): Promise<TMarkOrderPaid> {
  try {
    const updated = await prisma.order.updateMany({
      where: { id: orderId, status: "EXPIRED", paymentTransactionNsu: null },
      data: {
        ...paymentData(payment),
        paymentReview: true,
        paymentReviewReason: paymentReviewReasons.expiredStock,
      },
    });

    if (updated.count === 1) {
      return { result: "review", reason: paymentReviewReasons.expiredStock };
    }
  } catch (error) {
    if (!isUniqueConstraint(error)) throw error;
  }

  return classifyPayment(orderId, payment);
}

/**
 * Pedido expirado que foi pago de verdade: baixa o estoque de novo e, se
 * todos os itens tiverem quantidade, volta para PAID. Sem estoque, fica
 * expirado e marcado para revisão. A transação desfaz a baixa se o pedido
 * mudar no meio do caminho.
 */
async function payExpiredOrder(
  orderId: number,
  payment: IPaymentRecord,
): Promise<TMarkOrderPaid> {
  try {
    await prisma.$transaction(async (tx) => {
      const items = await tx.orderItem.findMany({
        where: { orderId },
        select: { productId: true, quantity: true },
        orderBy: { productId: "asc" },
      });

      for (const item of items) {
        const reserved = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (reserved.count !== 1) throw new StockShortError();
      }

      const updated = await tx.order.updateMany({
        where: { id: orderId, status: "EXPIRED", paymentTransactionNsu: null },
        data: {
          status: "PAID",
          paymentReview: false,
          paymentReviewReason: null,
          ...paymentData(payment),
        },
      });

      if (updated.count !== 1) throw new AlreadyChangedError();
    });

    return { result: "paid", stockChanged: true };
  } catch (error) {
    if (error instanceof StockShortError) {
      return flagExpiredWithoutStock(orderId, payment);
    }

    if (error instanceof AlreadyChangedError || isUniqueConstraint(error)) {
      return classifyPayment(orderId, payment);
    }

    throw error;
  }
}

/**
 * Marca o pedido como pago a partir de um pagamento já conferido. A troca de
 * status é condicional: webhook e página de obrigado ao mesmo tempo só
 * gravam uma vez. O mesmo transaction_nsu repetido não altera nada.
 *
 * Pedido já pago (ou adiante) não é mexido. Expirado tenta reativar. Cancelado
 * fica cancelado e vai para revisão.
 */
export async function markOrderPaid(
  orderId: number,
  payment: IPaymentRecord,
): Promise<TMarkOrderPaid> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, paymentTransactionNsu: true, paymentReview: true },
  });

  if (!order) return { result: "missing" };

  if (
    order.paymentTransactionNsu === payment.transactionNsu ||
    paidOrderStatuses.includes(order.status)
  ) {
    return classifyPayment(orderId, payment);
  }

  if (order.status === "EXPIRED") return payExpiredOrder(orderId, payment);

  if (order.status === "CANCELLED") {
    try {
      const updated = await prisma.order.updateMany({
        where: {
          id: orderId,
          status: "CANCELLED",
          paymentTransactionNsu: null,
        },
        data: {
          ...paymentData(payment),
          paymentReview: true,
          paymentReviewReason: paymentReviewReasons.cancelled,
        },
      });

      if (updated.count === 1) {
        return { result: "review", reason: paymentReviewReasons.cancelled };
      }
    } catch (error) {
      if (!isUniqueConstraint(error)) throw error;
    }

    return classifyPayment(orderId, payment);
  }

  if (order.status !== "AWAITING_PAYMENT") {
    return classifyPayment(orderId, payment);
  }

  try {
    const updated = await prisma.order.updateMany({
      where: {
        id: orderId,
        status: "AWAITING_PAYMENT",
        paymentTransactionNsu: null,
      },
      data: {
        status: "PAID",
        paymentReview: false,
        paymentReviewReason: null,
        ...paymentData(payment),
      },
    });

    if (updated.count === 1) return { result: "paid", stockChanged: false };
  } catch (error) {
    if (!isUniqueConstraint(error)) throw error;
  }

  return classifyPayment(orderId, payment);
}
