import assert from "node:assert/strict";
import { after, before, describe, it, mock } from "node:test";
import type { IOrderInput } from "../src/types/order";

// Estes testes usam o banco de DATABASE_URL e simulam a API da InfinitePay.
try {
  process.loadEnvFile(".env");
} catch {
  // sem .env: depende de DATABASE_URL já estar no ambiente
}

const hasDatabase = Boolean(process.env.DATABASE_URL);
const runId = `PAY-${Date.now()}`;
const apiKey = "inchk_teste-de-pagamento";
const webhookSecret = "segredo-do-webhook";

const envKeys = [
  "INFINITEPAY_API_KEY",
  "INFINITEPAY_HANDLE",
  "INFINITEPAY_WEBHOOK_SECRET",
  "INFINITEPAY_ORDER_PREFIX",
  "NEXT_PUBLIC_SITE_URL",
] as const;

const savedEnv = Object.fromEntries(
  envKeys.map((key) => [key, process.env[key]]),
);

const customer = {
  name: "Maria da Silva",
  email: "maria@example.com",
  phone: "11912345678",
};
const address = {
  postalCode: "01310100",
  street: "Avenida Paulista",
  number: "1000",
  complement: "",
  neighborhood: "Bela Vista",
  city: "São Paulo",
  state: "SP",
};

function orderInput(items: IOrderInput["items"]): IOrderInput {
  return { items, customer, address, shipping: 10 };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe(
  "InfinitePay payments",
  { skip: !hasDatabase && "DATABASE_URL not set" },
  () => {
    let prisma: typeof import("../src/lib/prisma").prisma;
    let createOrder: typeof import("../src/lib/orders").createOrder;
    let cancelOrder: typeof import("../src/lib/orders").cancelOrder;
    let expireOrder: typeof import("../src/lib/orders").expireOrder;
    let paymentReviewReasons: typeof import("../src/lib/orders").paymentReviewReasons;
    let confirmPayment: typeof import("../src/lib/payments").confirmPayment;
    let handleInfinitePayWebhook: typeof import("../src/lib/payments").handleInfinitePayWebhook;
    let readThankYou: typeof import("../src/lib/payments").readThankYou;
    let startCheckout: typeof import("../src/lib/payments").startCheckout;
    let categoryId: number;
    let counter = 0;
    let fetchMock: ReturnType<typeof mock.method>;
    let nextCheck: { status: number; body: unknown } = {
      status: 200,
      body: { success: true, paid: false },
    };

    function paidCheck(totalCents: number, extra = 10) {
      nextCheck = {
        status: 200,
        body: {
          success: true,
          paid: true,
          amount: totalCents,
          paid_amount: totalCents + extra,
          installments: 1,
          capture_method: "pix",
        },
      };
    }

    function notice(orderId: number, transaction = `txn-${runId}-${orderId}`) {
      return {
        orderNsu: `nix-${orderId}`,
        transactionNsu: transaction,
        slug: `slug-${orderId}`,
        receiptUrl: "https://comprovante.example/recibo",
      };
    }

    function webhook(body: unknown, token = webhookSecret) {
      return new Request(
        `https://nix3d.test/api/payments/infinitepay/webhook?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
      );
    }

    function webhookBody(orderId: number) {
      return {
        invoice_slug: `slug-${orderId}`,
        transaction_nsu: `txn-${runId}-${orderId}`,
        order_nsu: `nix-${orderId}`,
        receipt_url: "https://comprovante.example/recibo",
        amount: 1,
        capture_method: "credit_card",
        api_key: apiKey,
      };
    }

    async function createProduct(stock: number, price = 100) {
      counter += 1;
      return prisma.product.create({
        data: {
          sku: `${runId}-${counter}`,
          name: `Produto de pagamento ${counter}`,
          capacity: "12 filamentos",
          width: 35,
          height: 60,
          length: 46,
          weight: 18,
          price,
          installments: "3x",
          description: "Produto criado pelos testes de pagamento.",
          stock,
          categoryId,
        },
      });
    }

    async function expireNow(orderId: number) {
      await prisma.order.update({
        where: { id: orderId },
        data: { expiresAt: new Date(Date.now() - 60_000) },
      });
      assert.equal(await expireOrder(orderId, new Date()), true);
    }

    async function stockOf(productId: number) {
      const product = await prisma.product.findUniqueOrThrow({
        where: { id: productId },
      });
      return product.stock;
    }

    before(async () => {
      for (const [key, value] of Object.entries({
        INFINITEPAY_API_KEY: apiKey,
        INFINITEPAY_HANDLE: "nix3d",
        INFINITEPAY_WEBHOOK_SECRET: webhookSecret,
        INFINITEPAY_ORDER_PREFIX: "nix",
        NEXT_PUBLIC_SITE_URL: "https://nix3d.test",
      })) {
        process.env[key] = value;
      }

      fetchMock = mock.method(globalThis, "fetch", async () =>
        jsonResponse(nextCheck.body, nextCheck.status),
      );

      ({ prisma } = await import("../src/lib/prisma"));
      ({ createOrder, cancelOrder, expireOrder, paymentReviewReasons } =
        await import("../src/lib/orders"));
      ({ confirmPayment, handleInfinitePayWebhook, readThankYou, startCheckout } =
        await import("../src/lib/payments"));

      const category = await prisma.category.create({
        data: { slug: runId.toLowerCase(), name: runId },
      });
      categoryId = category.id;
    });

    after(async () => {
      mock.restoreAll();
      for (const key of envKeys) {
        const value = savedEnv[key];
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }

      if (!prisma) return;

      const products = await prisma.product.findMany({
        where: { categoryId },
        select: { id: true },
      });
      const productIds = products.map((product) => product.id);

      await prisma.order.deleteMany({
        where: { items: { some: { productId: { in: productIds } } } },
      });
      await prisma.product.deleteMany({ where: { categoryId } });
      await prisma.category.delete({ where: { id: categoryId } });
      await prisma.$disconnect();
    });

    it("rejects a bad token, an invalid body and an unknown order", async () => {
      const callsBefore = fetchMock.mock.callCount();

      assert.equal(
        (await handleInfinitePayWebhook(webhook({ order_nsu: "nix-1" }, "errado")))
          .status,
        401,
      );
      assert.equal(
        (await handleInfinitePayWebhook(webhook({ order_nsu: "nix-1" }))).status,
        400,
      );
      assert.equal(
        (
          await handleInfinitePayWebhook(
            webhook({
              order_nsu: "outra-loja-1",
              transaction_nsu: "txn",
              invoice_slug: "slug",
            }),
          )
        ).status,
        200,
      );

      assert.equal(fetchMock.mock.callCount(), callsBefore);
    });

    it("marks the order paid from the payment check, ignores a repeat and keeps the higher paid amount", async () => {
      const product = await createProduct(5, 100);
      const created = await createOrder(
        orderInput([{ productId: product.id, quantity: 2 }]),
      );
      paidCheck(21000, 100);

      const first = await handleInfinitePayWebhook(webhook(webhookBody(created.id)));
      assert.equal(first.status, 200);

      const order = await prisma.order.findUniqueOrThrow({
        where: { id: created.id },
      });
      assert.equal(order.status, "PAID");
      assert.ok(order.paidAt instanceof Date);
      assert.equal(order.paymentMethod, "pix");
      assert.equal(Number(order.paymentAmount), 210);
      assert.equal(Number(order.paidAmount), 211);
      assert.equal(order.paymentInstallments, 1);
      assert.equal(order.paymentTransactionNsu, `txn-${runId}-${created.id}`);
      assert.equal(order.paymentInvoiceSlug, `slug-${created.id}`);
      assert.equal(order.receiptUrl, "https://comprovante.example/recibo");
      assert.equal(order.paymentReview, false);
      assert.equal(await stockOf(product.id), 3);

      const event = await prisma.paymentEvent.findFirstOrThrow({
        where: { orderId: created.id, type: "paid" },
      });
      assert.equal(JSON.stringify(event.payload).includes(apiKey), false);

      const calls = fetchMock.mock.callCount();
      const second = await handleInfinitePayWebhook(webhook(webhookBody(created.id)));
      assert.equal(second.status, 200);
      assert.equal(fetchMock.mock.callCount(), calls);

      const again = await prisma.order.findUniqueOrThrow({
        where: { id: created.id },
      });
      assert.equal(again.paidAt?.toISOString(), order.paidAt?.toISOString());
      assert.equal(await stockOf(product.id), 3);
    });

    it("does not mark paid when the check says unpaid, the amount differs, or the check is down", async () => {
      const product = await createProduct(4, 50);
      const created = await createOrder(
        orderInput([{ productId: product.id, quantity: 1 }]),
      );

      nextCheck = { status: 200, body: { success: true, paid: false } };
      const unpaid = await handleInfinitePayWebhook(webhook(webhookBody(created.id)));
      assert.equal(unpaid.status, 200);
      assert.equal(
        (await prisma.order.findUniqueOrThrow({ where: { id: created.id } })).status,
        "AWAITING_PAYMENT",
      );

      nextCheck = {
        status: 200,
        body: {
          success: true,
          paid: true,
          amount: 1,
          paid_amount: 6000,
          installments: 1,
          capture_method: "credit_card",
        },
      };
      const mismatch = await handleInfinitePayWebhook(
        webhook({
          ...webhookBody(created.id),
          transaction_nsu: `txn-valor-${created.id}`,
        }),
      );
      assert.equal(mismatch.status, 200);

      const reviewed = await prisma.order.findUniqueOrThrow({
        where: { id: created.id },
      });
      assert.equal(reviewed.status, "AWAITING_PAYMENT");
      assert.equal(reviewed.paymentReview, true);
      assert.equal(reviewed.paymentReviewReason, paymentReviewReasons.amount);
      assert.equal(reviewed.paymentMethod, "credit_card");
      assert.equal(await stockOf(product.id), 3);

      const fresh = await createOrder(
        orderInput([{ productId: product.id, quantity: 1 }]),
      );
      nextCheck = { status: 503, body: { message: apiKey } };
      const down = await handleInfinitePayWebhook(webhook(webhookBody(fresh.id)));
      assert.equal(down.status, 400);
      const waiting = await prisma.order.findUniqueOrThrow({
        where: { id: fresh.id },
      });
      assert.equal(waiting.status, "AWAITING_PAYMENT");
      assert.equal(waiting.paymentReview, false);
      assert.equal(JSON.stringify(down).includes(apiKey), false);
    });

    it("lets only one of two concurrent confirmations change the order", async () => {
      const product = await createProduct(3, 80);
      const created = await createOrder(
        orderInput([{ productId: product.id, quantity: 1 }]),
      );
      paidCheck(9000, 0);
      const payment = notice(created.id);

      const [first, second] = await Promise.all([
        confirmPayment(payment),
        confirmPayment(payment),
      ]);

      assert.equal(
        (await prisma.order.findUniqueOrThrow({ where: { id: created.id } })).status,
        "PAID",
      );
      assert.equal(await stockOf(product.id), 2);
      assert.ok([first.status, second.status].every((status) => status === "paid"));
    });

    it("reactivates an expired order when every item is in stock", async () => {
      const product = await createProduct(5, 40);
      const created = await createOrder(
        orderInput([{ productId: product.id, quantity: 2 }]),
      );
      await expireNow(created.id);
      assert.equal(await stockOf(product.id), 5);

      paidCheck(9000, 0);
      const result = await confirmPayment(notice(created.id));

      assert.equal(result.status, "paid");
      assert.equal(result.stockChanged, true);
      assert.equal(
        (await prisma.order.findUniqueOrThrow({ where: { id: created.id } })).status,
        "PAID",
      );
      assert.equal(await stockOf(product.id), 3);
    });

    it("keeps an expired order for review when stock is gone", async () => {
      const product = await createProduct(1, 25);
      const created = await createOrder(
        orderInput([{ productId: product.id, quantity: 1 }]),
      );
      await expireNow(created.id);
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: 0 },
      });

      paidCheck(3500, 0);
      const result = await confirmPayment(notice(created.id));

      assert.equal(result.status, "review");
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: created.id },
      });
      assert.equal(order.status, "EXPIRED");
      assert.equal(order.paymentReview, true);
      assert.equal(order.paymentReviewReason, paymentReviewReasons.expiredStock);
      assert.equal(await stockOf(product.id), 0);
    });

    it("does not reactivate a cancelled order", async () => {
      const product = await createProduct(2, 15);
      const created = await createOrder(
        orderInput([{ productId: product.id, quantity: 1 }]),
      );
      assert.equal(await cancelOrder(created.id), true);
      const stock = await stockOf(product.id);

      paidCheck(2500, 0);
      const result = await confirmPayment(notice(created.id));

      assert.equal(result.status, "review");
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: created.id },
      });
      assert.equal(order.status, "CANCELLED");
      assert.equal(order.paymentReviewReason, paymentReviewReasons.cancelled);
      assert.equal(await stockOf(product.id), stock);
    });

    it("cancels the order and returns the stock when the checkout link fails", async () => {
      const product = await createProduct(4, 30);
      const created = await createOrder(
        orderInput([{ productId: product.id, quantity: 1 }]),
      );
      assert.equal(await stockOf(product.id), 3);

      nextCheck = { status: 500, body: { message: apiKey } };
      const checkout = await startCheckout(created.id);

      assert.equal(checkout.ok, false);
      if (!checkout.ok) {
        assert.equal(checkout.message.includes(apiKey), false);
      }
      assert.equal(
        (await prisma.order.findUniqueOrThrow({ where: { id: created.id } })).status,
        "CANCELLED",
      );
      assert.equal(await stockOf(product.id), 4);
    });

    it("does not mark an order paid from forged thank-you parameters", async () => {
      const product = await createProduct(2, 70);
      const created = await createOrder(
        orderInput([{ productId: product.id, quantity: 1 }]),
      );
      nextCheck = { status: 200, body: { success: true, paid: false } };

      const state = await readThankYou({
        order_nsu: `nix-${created.id}`,
        transaction_nsu: `txn-forjado-${created.id}`,
        slug: "forjado",
        receipt_url: "https://evil.example/recibo",
        capture_method: "pix",
        paid: "true",
      });

      assert.notEqual(state.status, "paid");
      assert.equal(state.receiptUrl, null);
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: created.id },
      });
      assert.equal(order.status, "AWAITING_PAYMENT");
      assert.equal(order.receiptUrl, null);
      assert.equal(order.paymentTransactionNsu, null);
    });
  },
);
