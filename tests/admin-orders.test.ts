import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { OrderStatus } from "../src/generated/prisma/enums";
import type { IAdminOrderFilters } from "../src/types/admin-order";

// Estes testes usam o banco de DATABASE_URL (veja o .env). Eles criam
// pedidos próprios, identificados pelo e-mail único desta execução, e
// removem tudo no final.
try {
  process.loadEnvFile(".env");
} catch {
  // sem .env: depende de DATABASE_URL já estar no ambiente
}

const hasDatabase = Boolean(process.env.DATABASE_URL);
const runId = `TEST-${Date.now()}`;
const emailDomain = `${runId.toLowerCase()}.example.com`;

function filters(
  overrides: Partial<IAdminOrderFilters> = {},
): IAdminOrderFilters {
  return {
    // Todo teste olha só para os pedidos desta execução.
    q: emailDomain,
    status: null,
    from: null,
    to: null,
    page: 1,
    ...overrides,
  };
}

describe(
  "getAdminOrders",
  { skip: !hasDatabase && "DATABASE_URL not set" },
  () => {
    let prisma: typeof import("../src/lib/prisma").prisma;
    let getAdminOrders: typeof import("../src/lib/admin-orders").getAdminOrders;
    let adminOrdersPageSize: number;
    let categoryId: number;
    let productId: number;
    let counter = 0;

    async function createOrder(options: {
      name?: string;
      email?: string;
      status?: OrderStatus;
      total?: number;
      quantities?: number[];
      createdAt?: Date;
    }) {
      counter += 1;
      const total = options.total ?? 100;

      return prisma.order.create({
        data: {
          status: options.status ?? "AWAITING_PAYMENT",
          subtotal: total,
          total,
          customerName: options.name ?? `Cliente ${counter}`,
          customerEmail: options.email ?? `cliente${counter}@${emailDomain}`,
          customerPhone: "11912345678",
          postalCode: "01310100",
          street: "Avenida Paulista",
          number: "1000",
          neighborhood: "Bela Vista",
          city: "São Paulo",
          state: "SP",
          ...(options.createdAt ? { createdAt: options.createdAt } : {}),
          items: {
            create: (options.quantities ?? [1]).map((quantity) => ({
              quantity,
              unitPrice: total,
              productId,
            })),
          },
        },
      });
    }

    before(async () => {
      ({ prisma } = await import("../src/lib/prisma"));
      ({ getAdminOrders } = await import("../src/lib/admin-orders"));
      ({ adminOrdersPageSize } =
        await import("../src/lib/admin-order-filters"));

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
          price: 100,
          installments: "12x",
          description: "Produto criado pelos testes da lista de pedidos.",
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

    it("lists the newest orders first with customer, total and item count", async () => {
      const older = await createOrder({
        name: `${runId} Antigo`,
        total: 120,
        createdAt: new Date(Date.now() - 3_600_000),
      });
      const newer = await createOrder({
        name: `${runId} Novo`,
        status: "PAID",
        total: 300,
        quantities: [1, 2],
      });

      const page = await getAdminOrders(filters());
      const ids = page.orders.map((order) => order.id);

      assert.ok(ids.indexOf(newer.id) < ids.indexOf(older.id));

      const listed = page.orders.find((order) => order.id === newer.id);
      assert.deepEqual(
        {
          status: listed?.status,
          customerName: listed?.customerName,
          total: listed?.total,
          itemCount: listed?.itemCount,
        },
        {
          status: "PAID",
          customerName: `${runId} Novo`,
          total: 300,
          itemCount: 3,
        },
      );
      assert.ok(listed?.createdAt instanceof Date);
    });

    it("filters by status", async () => {
      const paid = await createOrder({ status: "PAID" });
      const shipped = await createOrder({ status: "SHIPPED" });

      const page = await getAdminOrders(filters({ status: "SHIPPED" }));
      const ids = page.orders.map((order) => order.id);

      assert.ok(ids.includes(shipped.id));
      assert.ok(!ids.includes(paid.id));
      assert.ok(page.orders.every((order) => order.status === "SHIPPED"));
      assert.equal(page.total, page.orders.length);
    });

    it("searches the customer name, ignoring case", async () => {
      const target = await createOrder({ name: `${runId} Zenaide Quintana` });
      const other = await createOrder({ name: `${runId} Outra Pessoa` });

      const page = await getAdminOrders(filters({ q: "zenaide QUINTANA" }));

      assert.deepEqual(
        page.orders.map((order) => order.id),
        [target.id],
      );
      assert.ok(!page.orders.some((order) => order.id === other.id));
    });

    it("searches the customer e-mail", async () => {
      const target = await createOrder({
        email: `busca.unica@${emailDomain}`,
      });

      const page = await getAdminOrders(filters({ q: "BUSCA.UNICA@" }));

      assert.deepEqual(
        page.orders.map((order) => order.id),
        [target.id],
      );
    });

    it("searches by order number, with or without #", async () => {
      const target = await createOrder({});

      for (const q of [String(target.id), `#${target.id}`]) {
        const page = await getAdminOrders(filters({ q }));
        assert.ok(
          page.orders.some((order) => order.id === target.id),
          q,
        );
      }
    });

    it("does not break on a huge number or characters that look like patterns", async () => {
      for (const q of [
        "99999999999999",
        "100%",
        "a_b",
        "'; drop table",
        "\\",
      ]) {
        const page = await getAdminOrders(filters({ q }));
        // Sem o escape, "a_b" casaria com "Alb" e "%" com qualquer nome.
        assert.ok(
          !page.orders.some((order) =>
            order.customerEmail.endsWith(emailDomain),
          ),
          q,
        );
        assert.ok(page.pageCount >= 1);
      }
    });

    it("treats % and _ in the search as literal characters", async () => {
      const percent = await createOrder({ name: `Desconto 50% ${runId}` });
      const plain = await createOrder({ name: `Desconto 50x ${runId}` });
      const underscore = await createOrder({ name: `Cliente a_b ${runId}` });
      const letter = await createOrder({ name: `Cliente aXb ${runId}` });

      const byPercent = await getAdminOrders(filters({ q: `50% ${runId}` }));
      assert.deepEqual(
        byPercent.orders.map((order) => order.id),
        [percent.id],
      );
      assert.ok(!byPercent.orders.some((order) => order.id === plain.id));

      const byUnderscore = await getAdminOrders(filters({ q: `a_b ${runId}` }));
      assert.deepEqual(
        byUnderscore.orders.map((order) => order.id),
        [underscore.id],
      );
      assert.ok(!byUnderscore.orders.some((order) => order.id === letter.id));
    });

    it("filters by date range, including the whole last day in Brasília time", async () => {
      // 2020-03-10 23:30 em Brasília (02:30 do dia 11 em UTC): ainda é dia 10.
      const lateOnTenth = await createOrder({
        createdAt: new Date("2020-03-10T23:30:00-03:00"),
      });
      const earlyOnEleventh = await createOrder({
        createdAt: new Date("2020-03-11T00:30:00-03:00"),
      });
      const beforeStart = await createOrder({
        createdAt: new Date("2020-03-09T23:59:00-03:00"),
      });

      const onTenth = await getAdminOrders(
        filters({ from: "2020-03-10", to: "2020-03-10" }),
      );
      assert.deepEqual(
        onTenth.orders.map((order) => order.id),
        [lateOnTenth.id],
      );

      const fromTenth = await getAdminOrders(filters({ from: "2020-03-10" }));
      const fromTenthIds = fromTenth.orders.map((order) => order.id);
      assert.ok(fromTenthIds.includes(lateOnTenth.id));
      assert.ok(fromTenthIds.includes(earlyOnEleventh.id));
      assert.ok(!fromTenthIds.includes(beforeStart.id));

      const untilTenth = await getAdminOrders(filters({ to: "2020-03-10" }));
      const untilTenthIds = untilTenth.orders.map((order) => order.id);
      assert.ok(untilTenthIds.includes(beforeStart.id));
      assert.ok(untilTenthIds.includes(lateOnTenth.id));
      assert.ok(!untilTenthIds.includes(earlyOnEleventh.id));
    });

    it("combines the filters", async () => {
      const day = new Date("2019-05-05T12:00:00-03:00");
      const target = await createOrder({
        name: `${runId} Combinado`,
        status: "READY",
        createdAt: day,
      });
      await createOrder({
        name: `${runId} Combinado`,
        status: "PAID",
        createdAt: day,
      });
      await createOrder({
        name: `${runId} Combinado`,
        status: "READY",
        createdAt: new Date("2019-05-07T12:00:00-03:00"),
      });

      const page = await getAdminOrders(
        filters({
          q: `${runId} combinado`,
          status: "READY",
          from: "2019-05-05",
          to: "2019-05-06",
        }),
      );

      assert.deepEqual(
        page.orders.map((order) => order.id),
        [target.id],
      );
      assert.equal(page.total, 1);
    });

    it("paginates the results and reports the totals", async () => {
      const name = `${runId} Paginado`;
      const total = adminOrdersPageSize * 2 + 3;
      const base = Date.parse("2018-01-01T12:00:00-03:00");

      for (let index = 0; index < total; index += 1) {
        await createOrder({
          name,
          createdAt: new Date(base + index * 60_000),
        });
      }

      const first = await getAdminOrders(filters({ q: name }));
      const second = await getAdminOrders(filters({ q: name, page: 2 }));
      const third = await getAdminOrders(filters({ q: name, page: 3 }));

      assert.equal(first.total, total);
      assert.equal(first.pageCount, 3);
      assert.equal(first.pageSize, adminOrdersPageSize);
      assert.equal(first.orders.length, adminOrdersPageSize);
      assert.equal(second.orders.length, adminOrdersPageSize);
      assert.equal(third.orders.length, 3);

      const ids = [first, second, third].flatMap((page) =>
        page.orders.map((order) => order.id),
      );
      assert.equal(new Set(ids).size, total);

      // Mais recente primeiro, entre as páginas.
      const dates = [first, second, third].flatMap((page) =>
        page.orders.map((order) => order.createdAt.getTime()),
      );
      assert.deepEqual(
        dates,
        [...dates].sort((a, b) => b - a),
      );
    });

    it("moves a page past the end back to the last page", async () => {
      const name = `${runId} Ultima`;
      await createOrder({ name });

      const page = await getAdminOrders(filters({ q: name, page: 99 }));

      assert.equal(page.page, 1);
      assert.equal(page.pageCount, 1);
      assert.equal(page.orders.length, 1);
    });

    it("returns an empty page when nothing matches", async () => {
      const page = await getAdminOrders(
        filters({ q: `${runId} ninguem-com-este-nome` }),
      );

      assert.deepEqual(page.orders, []);
      assert.equal(page.total, 0);
      assert.equal(page.page, 1);
      assert.equal(page.pageCount, 1);
    });
  },
);
