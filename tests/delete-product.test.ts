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
try {
  process.loadEnvFile(".env.local");
} catch {
  // sem .env.local
}

const hasDatabase = Boolean(process.env.DATABASE_URL);
const runId = `DEL-${Date.now()}`;
const emailDomain = `${runId.toLowerCase()}.example.com`;

const blockingStatuses: OrderStatus[] = [
  "AWAITING_PAYMENT",
  "PAID",
  "IN_PRODUCTION",
  "READY",
];

function orderInput(items: IOrderInput["items"]): IOrderInput {
  return {
    items,
    customer: {
      name: "Maria da Silva",
      email: `maria@${emailDomain}`,
      phone: "11912345678",
      kind: "PERSON",
      document: "11144477735",
    },
    address: {
      postalCode: "01310100",
      street: "Avenida Paulista",
      number: "1000",
      complement: "",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    },
    shipping: null,
  };
}

describe(
  "delete product with orders",
  { skip: !hasDatabase && "DATABASE_URL not set" },
  () => {
    let prisma: typeof import("../src/lib/prisma").prisma;
    let createOrder: typeof import("../src/lib/orders").createOrder;
    let deleteProductById: typeof import("../src/lib/delete-product").deleteProductById;
    let deletedProductLabel: string;
    let getAdminOrder: typeof import("../src/lib/admin-orders").getAdminOrder;
    let categoryId: number;
    let counter = 0;

    async function createProduct(name = "Produto") {
      counter += 1;
      return prisma.product.create({
        data: {
          sku: `${runId}-${counter}`,
          name: `${name} ${counter}`,
          capacity: "12 filamentos",
          width: 35,
          height: 60,
          length: 46,
          weight: 18,
          price: 100,
          installments: "12x",
          description: "Produto criado pelos testes de exclusão.",
          stock: 10,
          categoryId,
        },
      });
    }

    async function orderFor(productId: number) {
      return createOrder(orderInput([{ productId, quantity: 1 }]));
    }

    async function setStatus(id: number, status: OrderStatus) {
      await prisma.order.update({ where: { id }, data: { status } });
    }

    before(async () => {
      ({ prisma } = await import("../src/lib/prisma"));
      ({ createOrder } = await import("../src/lib/orders"));
      ({ deleteProductById, deletedProductLabel } = await import(
        "../src/lib/delete-product"
      ));
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

    it("deletes a product that has no orders", async () => {
      const product = await createProduct();

      assert.deepEqual(await deleteProductById(product.id), { ok: true });
      assert.equal(
        await prisma.product.findUnique({ where: { id: product.id } }),
        null,
      );
    });

    it("deletes a product when every order is cancelled and detaches the items", async () => {
      const product = await createProduct("Cancelado");
      const first = await orderFor(product.id);
      const second = await orderFor(product.id);
      await setStatus(first.id, "CANCELLED");
      await setStatus(second.id, "CANCELLED");

      assert.deepEqual(await deleteProductById(product.id), { ok: true });
      assert.equal(
        await prisma.product.findUnique({ where: { id: product.id } }),
        null,
      );

      for (const created of [first, second]) {
        const detail = await getAdminOrder(created.id);
        assert.equal(detail?.status, "CANCELLED");
        assert.equal(detail?.items.length, 1);
        assert.equal(detail?.items[0].productId, null);
        assert.equal(detail?.items[0].name, deletedProductLabel);
        assert.equal(detail?.items[0].sku, "");
        assert.equal(detail?.items[0].image, "");
        assert.equal(detail?.items[0].quantity, 1);
        assert.equal(detail?.items[0].unitPrice, 100);
      }
    });

    it("deletes a product whose only order is expired", async () => {
      const product = await createProduct("Expirado");
      const created = await orderFor(product.id);
      await setStatus(created.id, "EXPIRED");

      assert.deepEqual(await deleteProductById(product.id), { ok: true });

      const detail = await getAdminOrder(created.id);
      assert.equal(detail?.status, "EXPIRED");
      assert.equal(detail?.items[0].productId, null);
      assert.equal(detail?.items[0].name, deletedProductLabel);
    });

    it("deletes a product whose only order is already shipped", async () => {
      const product = await createProduct("Enviado");
      const created = await orderFor(product.id);
      await setStatus(created.id, "SHIPPED");

      assert.deepEqual(await deleteProductById(product.id), { ok: true });

      const detail = await getAdminOrder(created.id);
      assert.equal(detail?.items[0].productId, null);
      assert.equal(detail?.items[0].name, deletedProductLabel);
    });

    it("keeps the other product on a cancelled order", async () => {
      const removed = await createProduct("Sai");
      const kept = await createProduct("Fica");
      const created = await createOrder(
        orderInput([
          { productId: removed.id, quantity: 2 },
          { productId: kept.id, quantity: 1 },
        ]),
      );
      await setStatus(created.id, "CANCELLED");

      assert.deepEqual(await deleteProductById(removed.id), { ok: true });

      const detail = await getAdminOrder(created.id);
      assert.equal(detail?.items[0].productId, null);
      assert.equal(detail?.items[0].name, deletedProductLabel);
      assert.equal(detail?.items[0].quantity, 2);
      assert.equal(detail?.items[1].productId, kept.id);
      assert.equal(detail?.items[1].name, kept.name);
      assert.equal(detail?.items[1].sku, kept.sku);
    });

    it("refuses while any order is still open and keeps every link", async () => {
      const product = await createProduct("Misto");
      const cancelled = await orderFor(product.id);
      const open = await orderFor(product.id);
      await setStatus(cancelled.id, "CANCELLED");
      await setStatus(open.id, "PAID");

      assert.deepEqual(await deleteProductById(product.id), {
        ok: false,
        reason: "in-use",
      });
      assert.ok(await prisma.product.findUnique({ where: { id: product.id } }));

      const cancelledItem = await prisma.orderItem.findFirst({
        where: { orderId: cancelled.id },
      });
      const openItem = await prisma.orderItem.findFirst({
        where: { orderId: open.id },
      });
      assert.equal(cancelledItem?.productId, product.id);
      assert.equal(openItem?.productId, product.id);

      const detail = await getAdminOrder(cancelled.id);
      assert.equal(detail?.items[0].name, product.name);
    });

    for (const status of blockingStatuses) {
      it(`refuses an order in ${status}`, async () => {
        const product = await createProduct(status);
        const created = await orderFor(product.id);
        await setStatus(created.id, status);

        assert.deepEqual(await deleteProductById(product.id), {
          ok: false,
          reason: "in-use",
        });
        assert.ok(
          await prisma.product.findUnique({ where: { id: product.id } }),
        );
      });
    }

    it("reports a missing product", async () => {
      assert.deepEqual(await deleteProductById(2_147_483_647), {
        ok: false,
        reason: "not-found",
      });
    });
  },
);
