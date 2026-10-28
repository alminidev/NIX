import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { OrderStatus } from "../src/generated/prisma/enums";
import type { IOrderInput } from "../src/types/order";

// Estes testes usam o banco de DATABASE_URL (veja o .env). Eles criam
// produtos e pedidos próprios, com SKU e e-mail únicos desta execução, e
// removem tudo no final.
try {
  process.loadEnvFile(".env");
} catch {
  // sem .env: depende de DATABASE_URL já estar no ambiente
}

const hasDatabase = Boolean(process.env.DATABASE_URL);
const runId = `TEST-${Date.now()}`;
const emailDomain = `${runId.toLowerCase()}.example.com`;

function orderInput(
  items: IOrderInput["items"],
  shipping: number | null = null,
  quote?: Pick<IOrderInput, "shippingService" | "deliveryDays">,
): IOrderInput {
  return {
    items,
    ...quote,
    customer: {
      name: "Maria da Silva",
      email: `maria@${emailDomain}`,
      phone: "11912345678",
    },
    address: {
      postalCode: "01310100",
      street: "Avenida Paulista",
      number: "1000",
      complement: "Sala 12",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    },
    shipping,
  };
}

describe(
  "admin order detail and status change",
  { skip: !hasDatabase && "DATABASE_URL not set" },
  () => {
    let prisma: typeof import("../src/lib/prisma").prisma;
    let createOrder: typeof import("../src/lib/orders").createOrder;
    let changeOrderStatus: typeof import("../src/lib/orders").changeOrderStatus;
    let getAdminOrder: typeof import("../src/lib/admin-orders").getAdminOrder;
    let categoryId: number;
    let counter = 0;

    async function createProduct(stock: number, price = 100) {
      counter += 1;
      return prisma.product.create({
        data: {
          sku: `${runId}-${counter}`,
          name: `Produto ${counter}`,
          capacity: "12 filamentos",
          width: 35,
          height: 60,
          length: 46,
          weight: 18,
          price,
          installments: "12x",
          description: "Produto criado pelos testes do pedido.",
          stock,
          categoryId,
        },
      });
    }

    async function newOrder(stock = 10, quantity = 2) {
      const product = await createProduct(stock);
      const order = await createOrder(
        orderInput([{ productId: product.id, quantity }]),
      );
      return { product, order };
    }

    async function setStatus(id: number, status: OrderStatus) {
      await prisma.order.update({ where: { id }, data: { status } });
    }

    async function statusOf(id: number) {
      const order = await prisma.order.findUniqueOrThrow({ where: { id } });
      return order.status;
    }

    async function stockOf(id: number) {
      const product = await prisma.product.findUniqueOrThrow({ where: { id } });
      return product.stock;
    }

    before(async () => {
      ({ prisma } = await import("../src/lib/prisma"));
      ({ createOrder, changeOrderStatus } = await import("../src/lib/orders"));
      ({ getAdminOrder } = await import("../src/lib/admin-orders"));

      const category = await prisma.category.create({
        data: { slug: runId.toLowerCase(), name: runId },
      });
      categoryId = category.id;
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

    describe("getAdminOrder", () => {
      it("returns items, customer, address, totals and dates", async () => {
        const first = await createProduct(10, 49.9);
        const second = await createProduct(10, 100);
        await prisma.productImage.createMany({
          data: [
            { productId: first.id, url: "/a.png", sortOrder: 0 },
            {
              productId: first.id,
              url: "/b.png",
              sortOrder: 1,
              isPrimary: true,
            },
          ],
        });

        const created = await createOrder(
          orderInput(
            [
              { productId: first.id, quantity: 3 },
              { productId: second.id, quantity: 1 },
            ],
            25.5,
            {
              shippingService: "Correios · PAC",
              deliveryDays: 7,
            },
          ),
        );

        const order = await getAdminOrder(created.id);

        assert.ok(order);
        assert.equal(order.id, created.id);
        assert.equal(order.status, "AWAITING_PAYMENT");
        assert.equal(order.source, "SITE");
        assert.deepEqual(order.customer, {
          name: "Maria da Silva",
          email: `maria@${emailDomain}`,
          phone: "11912345678",
        });
        assert.deepEqual(order.address, {
          postalCode: "01310100",
          street: "Avenida Paulista",
          number: "1000",
          complement: "Sala 12",
          neighborhood: "Bela Vista",
          city: "São Paulo",
          state: "SP",
        });
        assert.equal(order.itemCount, 4);
        assert.equal(order.items.length, 2);
        assert.equal(order.items[0].name, first.name);
        assert.equal(order.items[0].sku, first.sku);
        assert.equal(order.items[0].quantity, 3);
        assert.equal(order.items[0].unitPrice, 49.9);
        assert.equal(order.items[0].lineTotal, 149.7);
        assert.equal(order.items[0].image, "/b.png");
        assert.equal(order.items[1].image, "");
        assert.equal(order.subtotal, 249.7);
        assert.equal(order.shipping, 25.5);
        assert.equal(order.shippingService, "Correios · PAC");
        assert.equal(order.deliveryDays, 7);
        assert.equal(order.total, 275.2);
        assert.equal(order.trackingCode, null);
        assert.ok(order.createdAt instanceof Date);
        assert.ok(order.updatedAt instanceof Date);
        assert.ok(order.expiresAt instanceof Date);
      });

      it("keeps a missing shipping and complement empty", async () => {
        const product = await createProduct(5);
        const input = orderInput([{ productId: product.id, quantity: 1 }]);
        input.address.complement = "";
        const created = await createOrder(input);

        const order = await getAdminOrder(created.id);

        assert.equal(order?.shipping, null);
        assert.equal(order?.shippingService, null);
        assert.equal(order?.deliveryDays, null);
        assert.equal(order?.address.complement, "");
      });

      it("returns null for an unknown order", async () => {
        assert.equal(await getAdminOrder(2_147_483_647), null);
      });
    });

    describe("changeOrderStatus", () => {
      it("walks an order from payment to shipped and saves the tracking code", async () => {
        const { order } = await newOrder();

        assert.equal(await changeOrderStatus(order.id, "PAID"), "changed");
        assert.equal(
          await changeOrderStatus(order.id, "IN_PRODUCTION"),
          "changed",
        );
        assert.equal(await changeOrderStatus(order.id, "READY"), "changed");
        assert.equal(
          await changeOrderStatus(order.id, "SHIPPED", "BR123456789"),
          "changed",
        );

        const detail = await getAdminOrder(order.id);
        assert.equal(detail?.status, "SHIPPED");
        assert.equal(detail?.trackingCode, "BR123456789");
      });

      it("lets the admin undo a step", async () => {
        const { order } = await newOrder();
        await setStatus(order.id, "IN_PRODUCTION");

        assert.equal(await changeOrderStatus(order.id, "PAID"), "changed");
        assert.equal(await statusOf(order.id), "PAID");
      });

      it("refuses to skip steps and leaves the order untouched", async () => {
        const { order } = await newOrder();

        assert.equal(
          await changeOrderStatus(order.id, "SHIPPED"),
          "not-allowed",
        );
        assert.equal(
          await changeOrderStatus(order.id, "IN_PRODUCTION"),
          "not-allowed",
        );
        assert.equal(await statusOf(order.id), "AWAITING_PAYMENT");
      });

      it("never sets EXPIRED or goes back to awaiting payment", async () => {
        const { order } = await newOrder();
        await setStatus(order.id, "PAID");

        assert.equal(
          await changeOrderStatus(order.id, "EXPIRED"),
          "not-allowed",
        );
        assert.equal(
          await changeOrderStatus(order.id, "AWAITING_PAYMENT"),
          "not-allowed",
        );
        assert.equal(await statusOf(order.id), "PAID");
      });

      it("ignores the tracking code for statuses other than shipped", async () => {
        const { order } = await newOrder();

        await changeOrderStatus(order.id, "PAID", "BR000");

        assert.equal((await getAdminOrder(order.id))?.trackingCode, null);
      });

      it("returns the stock when cancelling", async () => {
        const { product, order } = await newOrder(10, 3);
        assert.equal(await stockOf(product.id), 7);

        assert.equal(await changeOrderStatus(order.id, "CANCELLED"), "changed");

        assert.equal(await statusOf(order.id), "CANCELLED");
        assert.equal(await stockOf(product.id), 10);
      });

      it("cancels a paid order, but not one already in production", async () => {
        const paid = await newOrder(10, 2);
        await setStatus(paid.order.id, "PAID");
        assert.equal(
          await changeOrderStatus(paid.order.id, "CANCELLED"),
          "changed",
        );
        assert.equal(await stockOf(paid.product.id), 10);

        const inProduction = await newOrder(10, 2);
        await setStatus(inProduction.order.id, "IN_PRODUCTION");
        assert.equal(
          await changeOrderStatus(inProduction.order.id, "CANCELLED"),
          "not-allowed",
        );
        assert.equal(await stockOf(inProduction.product.id), 8);
      });

      it("returns the stock only once when cancelling twice", async () => {
        const { product, order } = await newOrder(10, 2);

        assert.equal(await changeOrderStatus(order.id, "CANCELLED"), "changed");
        assert.equal(
          await changeOrderStatus(order.id, "CANCELLED"),
          "not-allowed",
        );
        assert.equal(await stockOf(product.id), 10);
      });

      it("keeps cancelled and expired orders final", async () => {
        const cancelled = await newOrder();
        await changeOrderStatus(cancelled.order.id, "CANCELLED");
        assert.equal(
          await changeOrderStatus(cancelled.order.id, "PAID"),
          "not-allowed",
        );

        const expired = await newOrder();
        await setStatus(expired.order.id, "EXPIRED");
        assert.equal(
          await changeOrderStatus(expired.order.id, "PAID"),
          "not-allowed",
        );
        assert.equal(await statusOf(expired.order.id), "EXPIRED");
      });

      it("reports an order that does not exist", async () => {
        assert.equal(
          await changeOrderStatus(2_147_483_647, "PAID"),
          "not-found",
        );
        assert.equal(
          await changeOrderStatus(2_147_483_647, "CANCELLED"),
          "not-found",
        );
      });

      it("lets only one of two simultaneous changes win", async () => {
        const { order } = await newOrder();

        const results = await Promise.all([
          changeOrderStatus(order.id, "PAID"),
          changeOrderStatus(order.id, "PAID"),
        ]);

        assert.deepEqual([...results].sort(), ["changed", "not-allowed"]);
      });
    });
  },
);
