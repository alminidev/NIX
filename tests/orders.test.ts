import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { IOrderInput } from "../src/types/order";

// Estes testes usam o banco de DATABASE_URL (veja o .env). Eles criam
// produtos próprios, com SKU único, e removem tudo no final.
try {
  process.loadEnvFile(".env");
} catch {
  // sem .env: depende de DATABASE_URL já estar no ambiente
}

const hasDatabase = Boolean(process.env.DATABASE_URL);
const runId = `TEST-${Date.now()}`;

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

function orderInput(
  items: IOrderInput["items"],
  shipping: number | null = null,
): IOrderInput {
  return { items, customer, address, shipping };
}

describe(
  "createOrder",
  { skip: !hasDatabase && "DATABASE_URL not set" },
  () => {
    let prisma: typeof import("../src/lib/prisma").prisma;
    let createOrder: typeof import("../src/lib/orders").createOrder;
    let InsufficientStockError: typeof import("../src/app/_errors/insufficient-stock.error").InsufficientStockError;
    let categoryId: number;
    let counter = 0;

    async function createProduct(stock: number, price = 1190.5, active = true) {
      counter += 1;
      return prisma.product.create({
        data: {
          sku: `${runId}-${counter}`,
          name: `Produto de teste ${counter}`,
          capacity: "12 filamentos",
          width: 35,
          height: 60,
          depth: 46,
          price,
          installments: "12x",
          description: "Produto criado pelos testes de pedido.",
          stock,
          active,
          categoryId,
        },
      });
    }

    before(async () => {
      ({ prisma } = await import("../src/lib/prisma"));
      ({ createOrder } = await import("../src/lib/orders"));
      ({ InsufficientStockError } =
        await import("../src/app/_errors/insufficient-stock.error"));

      const category = await prisma.category.create({
        data: { slug: runId.toLowerCase(), name: runId },
      });
      categoryId = category.id;
    });

    after(async () => {
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

    it("creates the order, its items and the totals, and takes the stock", async () => {
      const first = await createProduct(5, 1190.5);
      const second = await createProduct(3, 99.9);

      const created = await createOrder(
        orderInput(
          [
            { productId: first.id, quantity: 2 },
            { productId: second.id, quantity: 1 },
          ],
          45.1,
        ),
      );

      assert.equal(created.subtotal, 2480.9);
      assert.equal(created.shipping, 45.1);
      assert.equal(created.total, 2526);

      const order = await prisma.order.findUniqueOrThrow({
        where: { id: created.id },
        include: { items: { orderBy: { productId: "asc" } } },
      });

      assert.equal(order.status, "AWAITING_PAYMENT");
      assert.equal(order.source, "SITE");
      assert.equal(order.trackingCode, null);
      assert.equal(Number(order.subtotal), 2480.9);
      assert.equal(Number(order.shipping), 45.1);
      assert.equal(Number(order.total), 2526);
      assert.equal(order.customerEmail, "maria@example.com");
      assert.equal(order.postalCode, "01310100");
      assert.equal(order.complement, null);
      assert.deepEqual(
        order.items.map((item) => [item.productId, item.quantity]),
        [
          [first.id, 2],
          [second.id, 1],
        ],
      );

      const stocks = await prisma.product.findMany({
        where: { id: { in: [first.id, second.id] } },
        orderBy: { id: "asc" },
        select: { stock: true },
      });
      assert.deepEqual(
        stocks.map((product) => product.stock),
        [3, 2],
      );
    });

    it("leaves the shipping empty while it has not been quoted", async () => {
      const product = await createProduct(2, 100);

      const created = await createOrder(
        orderInput([{ productId: product.id, quantity: 1 }]),
      );
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: created.id },
      });

      assert.equal(created.shipping, null);
      assert.equal(created.total, 100);
      assert.equal(order.shipping, null);
      assert.equal(Number(order.total), 100);
    });

    it("freezes the unit price when the product price changes later", async () => {
      const product = await createProduct(4, 500);

      const created = await createOrder(
        orderInput([{ productId: product.id, quantity: 2 }]),
      );
      await prisma.product.update({
        where: { id: product.id },
        data: { price: 750 },
      });

      const order = await prisma.order.findUniqueOrThrow({
        where: { id: created.id },
        include: { items: true },
      });

      assert.equal(Number(order.items[0].unitPrice), 500);
      assert.equal(Number(order.subtotal), 1000);
    });

    it("fails with a clear message and keeps everything untouched when stock is short", async () => {
      const enough = await createProduct(5);
      const short = await createProduct(1);
      const ordersBefore = await prisma.order.count();

      await assert.rejects(
        createOrder(
          orderInput([
            { productId: enough.id, quantity: 2 },
            { productId: short.id, quantity: 2 },
          ]),
        ),
        (error) => {
          assert.ok(error instanceof InsufficientStockError);
          assert.match(error.message, /só resta 1 unidade/);
          assert.match(error.message, new RegExp(short.name));
          return true;
        },
      );

      assert.equal(await prisma.order.count(), ordersBefore);
      const stocks = await prisma.product.findMany({
        where: { id: { in: [enough.id, short.id] } },
        orderBy: { id: "asc" },
        select: { stock: true },
      });
      assert.deepEqual(
        stocks.map((product) => product.stock),
        [5, 1],
      );
    });

    it("rejects a product that is out of stock or inactive", async () => {
      const soldOut = await createProduct(0);
      const inactive = await createProduct(5, 100, false);

      await assert.rejects(
        createOrder(orderInput([{ productId: soldOut.id, quantity: 1 }])),
        /sem estoque/,
      );
      await assert.rejects(
        createOrder(orderInput([{ productId: inactive.id, quantity: 1 }])),
        /não está mais disponível/,
      );
      await assert.rejects(
        createOrder(orderInput([{ productId: 2_000_000_000, quantity: 1 }])),
        /não está mais disponível/,
      );
    });

    it("never oversells under concurrent orders", async () => {
      const product = await createProduct(3);

      const results = await Promise.allSettled(
        Array.from({ length: 10 }, () =>
          createOrder(orderInput([{ productId: product.id, quantity: 1 }])),
        ),
      );

      const fulfilled = results.filter(
        (result) => result.status === "fulfilled",
      );
      const rejected = results.filter((result) => result.status === "rejected");

      assert.equal(fulfilled.length, 3);
      assert.equal(rejected.length, 7);
      for (const result of rejected) {
        assert.ok(result.reason instanceof InsufficientStockError);
      }

      const after = await prisma.product.findUniqueOrThrow({
        where: { id: product.id },
      });
      assert.equal(after.stock, 0);
      assert.equal(
        await prisma.orderItem.count({ where: { productId: product.id } }),
        3,
      );
    });

    it("does not deadlock when concurrent orders share products", async () => {
      const first = await createProduct(10);
      const second = await createProduct(10);

      const results = await Promise.allSettled(
        Array.from({ length: 6 }, (_, index) =>
          createOrder(
            orderInput(
              index % 2 === 0
                ? [
                    { productId: first.id, quantity: 1 },
                    { productId: second.id, quantity: 1 },
                  ]
                : [
                    { productId: second.id, quantity: 1 },
                    { productId: first.id, quantity: 1 },
                  ],
            ),
          ),
        ),
      );

      assert.ok(results.every((result) => result.status === "fulfilled"));
      const stocks = await prisma.product.findMany({
        where: { id: { in: [first.id, second.id] } },
        select: { stock: true },
      });
      assert.deepEqual(
        stocks.map((product) => product.stock),
        [4, 4],
      );
    });
  },
);
