import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { OrderStatus } from "../src/generated/prisma/enums";

// Estes testes usam o banco de DATABASE_URL (veja o .env). Como o banco pode
// ter outros pedidos, eles comparam as métricas antes e depois de criar
// pedidos próprios e removem tudo no final.
try {
  process.loadEnvFile(".env");
} catch {
  // sem .env: depende de DATABASE_URL já estar no ambiente
}

const hasDatabase = Boolean(process.env.DATABASE_URL);
const runId = `TEST-${Date.now()}`;
const emailDomain = `${runId.toLowerCase()}.example.com`;

describe(
  "getDashboardMetrics (orders)",
  { skip: !hasDatabase && "DATABASE_URL not set" },
  () => {
    let prisma: typeof import("../src/lib/prisma").prisma;
    let getDashboardMetrics: typeof import("../src/lib/dashboard").getDashboardMetrics;
    let orderStatuses: typeof import("../src/lib/order-status").orderStatuses;
    let categoryId: number;
    let productId: number;
    let counter = 0;

    async function createOrder(
      status: OrderStatus,
      total: number,
      createdAt?: Date,
    ) {
      counter += 1;
      return prisma.order.create({
        data: {
          status,
          subtotal: total,
          total,
          customerName: "Cliente de teste",
          customerEmail: `cliente${counter}@${emailDomain}`,
          customerPhone: "11912345678",
          postalCode: "01310100",
          street: "Avenida Paulista",
          number: "1000",
          neighborhood: "Bela Vista",
          city: "São Paulo",
          state: "SP",
          ...(createdAt ? { createdAt } : {}),
          items: { create: [{ quantity: 1, unitPrice: total, productId }] },
        },
      });
    }

    before(async () => {
      ({ prisma } = await import("../src/lib/prisma"));
      ({ getDashboardMetrics } = await import("../src/lib/dashboard"));
      ({ orderStatuses } = await import("../src/lib/order-status"));

      const category = await prisma.category.create({
        data: { slug: runId.toLowerCase(), name: runId },
      });
      categoryId = category.id;

      const product = await prisma.product.create({
        data: {
          sku: `${runId}-1`,
          name: "Produto de teste",
          capacity: "12 filamentos",
          width: 35,
          height: 60,
          length: 46,
          weight: 18,
          price: 100,
          installments: "12x",
          description: "Produto criado pelos testes do dashboard.",
          stock: 100,
          categoryId,
        },
      });
      productId = product.id;
    });

    after(async () => {
      if (!prisma) return;

      await prisma.order.deleteMany({
        where: { customerEmail: { endsWith: `@${emailDomain}` } },
      });
      await prisma.product.deleteMany({ where: { categoryId } });
      await prisma.category.delete({ where: { id: categoryId } });
      await prisma.$disconnect();
    });

    it("counts orders by status, awaiting payment and revenue from paid orders only", async () => {
      const before = await getDashboardMetrics();

      // Receita: PAID, IN_PRODUCTION, READY e SHIPPED. Fora dela: AWAITING_PAYMENT, CANCELLED e EXPIRED.
      await createOrder("AWAITING_PAYMENT", 1000);
      await createOrder("AWAITING_PAYMENT", 1000);
      await createOrder("PAID", 100.1);
      await createOrder("IN_PRODUCTION", 200.2);
      await createOrder("READY", 300.3);
      await createOrder("SHIPPED", 400.4);
      await createOrder("CANCELLED", 5000);
      await createOrder("EXPIRED", 7000);

      const after = await getDashboardMetrics();
      const count = (metrics: typeof before, status: OrderStatus) =>
        metrics.ordersByStatus.find((item) => item.status === status)?.count;

      assert.equal(after.orders - before.orders, 8);
      assert.equal(after.awaitingPayment - before.awaitingPayment, 2);
      assert.equal(after.paidOrders - before.paidOrders, 4);
      assert.equal(
        Math.round((after.revenue - before.revenue) * 100),
        Math.round(1001 * 100),
      );

      for (const status of orderStatuses) {
        const expected = status === "AWAITING_PAYMENT" ? 2 : 1;
        assert.equal(
          (count(after, status) ?? 0) - (count(before, status) ?? 0),
          expected,
          status,
        );
      }
    });

    it("lists every status in lifecycle order, even without orders", async () => {
      const metrics = await getDashboardMetrics();

      assert.deepEqual(
        metrics.ordersByStatus.map((item) => item.status),
        orderStatuses,
      );
      assert.equal(
        metrics.orders,
        metrics.ordersByStatus.reduce((sum, item) => sum + item.count, 0),
      );
    });

    it("limits order metrics to the selected month and keeps open payments global", async () => {
      const allBefore = await getDashboardMetrics();
      const octoberBefore = await getDashboardMetrics("2020-10");
      const novemberBefore = await getDashboardMetrics("2020-11");

      // 31/10 23:30 em Brasília ainda é outubro; 00:00 de 01/11 já é novembro.
      await createOrder(
        "PAID",
        150,
        new Date("2020-10-15T15:00:00-03:00"),
      );
      await createOrder(
        "SHIPPED",
        10,
        new Date("2020-11-01T02:30:00.000Z"),
      );
      await createOrder(
        "AWAITING_PAYMENT",
        80,
        new Date("2020-11-02T12:00:00-03:00"),
      );
      await createOrder("PAID", 40, new Date("2020-11-01T03:00:00.000Z"));

      const october = await getDashboardMetrics("2020-10");
      const november = await getDashboardMetrics("2020-11");
      const allAfter = await getDashboardMetrics();

      assert.equal(october.orders - octoberBefore.orders, 2);
      assert.equal(october.paidOrders - octoberBefore.paidOrders, 2);
      assert.equal(
        Math.round((october.revenue - octoberBefore.revenue) * 100),
        16000,
      );
      assert.equal(november.orders - novemberBefore.orders, 2);
      assert.equal(november.paidOrders - novemberBefore.paidOrders, 1);
      assert.equal(
        Math.round((november.revenue - novemberBefore.revenue) * 100),
        4000,
      );
      assert.equal(allAfter.orders - allBefore.orders, 4);
      assert.equal(october.awaitingPayment - octoberBefore.awaitingPayment, 1);
      assert.equal(november.awaitingPayment, october.awaitingPayment);
    });

    it("derives the average ticket from revenue and paid orders", async () => {
      const metrics = await getDashboardMetrics();

      if (metrics.paidOrders === 0) {
        assert.equal(metrics.averageTicket, null);
        return;
      }

      assert.ok(metrics.averageTicket !== null);
      assert.ok(
        Math.abs(
          metrics.averageTicket * metrics.paidOrders - metrics.revenue,
        ) <=
          0.01 * metrics.paidOrders,
      );
    });
  },
);
