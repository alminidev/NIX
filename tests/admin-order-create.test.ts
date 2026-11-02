import assert from "node:assert/strict";
import { after, before, describe, it, mock } from "node:test";
import { isInfinitePayCheckoutUrl } from "../src/lib/checkout-url";
import { calculateExpiresAt } from "../src/lib/order-expiration";
import { localPickupOption } from "../src/lib/shipping-display";
import type { ICartItem } from "../src/types/cart";

// Estes testes usam o banco de DATABASE_URL (veja o .env). Eles criam
// produtos próprios, com SKU único, e removem tudo no final. A InfinitePay
// e o Melhor Envio são simulados.
try {
  process.loadEnvFile(".env");
} catch {
  // sem .env
}
try {
  process.loadEnvFile(".env.local");
} catch {
  // sem .env.local: depende de DATABASE_URL já estar no ambiente
}

const hasDatabase = Boolean(process.env.DATABASE_URL);
const runId = `ADM-${Date.now()}`;
const checkoutUrl = "https://checkout.infinitepay.io/pay/pedido-admin";

const envKeys = [
  "INFINITEPAY_API_KEY",
  "INFINITEPAY_HANDLE",
  "INFINITEPAY_WEBHOOK_SECRET",
  "INFINITEPAY_ORDER_PREFIX",
  "NEXT_PUBLIC_SITE_URL",
  "MELHOR_ENVIO_TOKEN",
  "MELHOR_ENVIO_BASE_URL",
  "MELHOR_ENVIO_FROM_POSTAL_CODE",
  "MELHOR_ENVIO_USER_AGENT",
] as const;

const savedEnv = Object.fromEntries(
  envKeys.map((key) => [key, process.env[key]]),
);

const address = {
  postalCode: "01310100",
  street: "Avenida Paulista",
  number: "1000",
  complement: "",
  neighborhood: "Bela Vista",
  city: "São Paulo",
  state: "SP",
};

function todayInBrazil() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function carrierQuote(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: "PAC",
    price: "40.00",
    custom_price: "42.50",
    delivery_time: 8,
    custom_delivery_time: 9,
    company: { id: 1, name: "Correios" },
    ...overrides,
  };
}

describe(
  "submitAdminOrder",
  { skip: !hasDatabase && "DATABASE_URL not set" },
  () => {
    let prisma: typeof import("../src/lib/prisma").prisma;
    let submitAdminOrder: typeof import("../src/lib/admin-new-order").submitAdminOrder;
    let quoteShipping: typeof import("../src/app/cart/actions").quoteShipping;
    let categoryId: number;
    let counter = 0;
    let fetchMock: ReturnType<typeof mock.method> | undefined;
    const infinitePayBodies: { items?: { price: number; quantity: number }[] }[] =
      [];

    async function createProduct(stock: number, price = 100) {
      counter += 1;
      return prisma.product.create({
        data: {
          sku: `${runId}-${counter}`,
          name: `Produto admin ${counter}`,
          capacity: "12 filamentos",
          width: 35,
          height: 60,
          length: 46,
          weight: 18,
          price,
          installments: "3x",
          description: "Produto criado pelos testes de pedido do admin.",
          stock,
          active: true,
          categoryId,
        },
      });
    }

    async function stockOf(productId: number) {
      const product = await prisma.product.findUniqueOrThrow({
        where: { id: productId },
      });
      return product.stock;
    }

    function form(options: {
      items: ICartItem[];
      email?: string;
      source?: string;
      shippingServiceId?: string;
      paymentChoice?: string;
      paymentMethod?: string;
      paidOn?: string;
      street?: string;
      postalCode?: string;
      city?: string;
      state?: string;
      number?: string;
      neighborhood?: string;
    }) {
      const body = new FormData();
      const fields: Record<string, string> = {
        name: "Maria da Silva",
        email: options.email ?? `maria-${runId}@example.com`,
        phone: "11912345678",
        postalCode: options.postalCode ?? address.postalCode,
        street: options.street ?? address.street,
        number: options.number ?? address.number,
        complement: address.complement,
        neighborhood: options.neighborhood ?? address.neighborhood,
        city: options.city ?? address.city,
        state: options.state ?? address.state,
        source: options.source ?? "WHATSAPP",
        paymentChoice: options.paymentChoice ?? "external",
        paymentMethod: options.paymentMethod ?? "pix",
        paidOn: options.paidOn ?? todayInBrazil(),
        shippingServiceId: options.shippingServiceId ?? "0",
        items: JSON.stringify(options.items),
      };

      for (const [key, value] of Object.entries(fields)) {
        if (value !== "") body.set(key, value);
      }

      return body;
    }

    before(async () => {
      for (const [key, value] of Object.entries({
        INFINITEPAY_API_KEY: "inchk_teste-admin",
        INFINITEPAY_HANDLE: "nix3d",
        INFINITEPAY_WEBHOOK_SECRET: "segredo-admin",
        INFINITEPAY_ORDER_PREFIX: "nix",
        NEXT_PUBLIC_SITE_URL: "https://nix3d.test",
        MELHOR_ENVIO_TOKEN: "token-secreto",
        MELHOR_ENVIO_BASE_URL: "https://sandbox.melhorenvio.com.br",
        MELHOR_ENVIO_FROM_POSTAL_CODE: "01310100",
        MELHOR_ENVIO_USER_AGENT: "NIX (teste@nix3d.com.br)",
      })) {
        process.env[key] = value;
      }

      fetchMock = mock.method(
        globalThis,
        "fetch",
        async (input: RequestInfo | URL, init?: RequestInit) => {
          const url =
            typeof input === "string"
              ? input
              : input instanceof URL
                ? input.href
                : input.url;

          if (url.includes("viacep.com.br")) {
            return jsonResponse({
              cep: "01310-100",
              logradouro: "Avenida Paulista",
              bairro: "Bela Vista",
              localidade: "São Paulo",
              uf: "SP",
            });
          }

          if (url.includes("melhorenvio.com.br")) {
            return jsonResponse([
              carrierQuote(),
              carrierQuote({
                id: 2,
                name: "SEDEX",
                custom_price: "60.00",
                price: "60.00",
                custom_delivery_time: 3,
                delivery_time: 2,
              }),
            ]);
          }

          if (url.includes("infinitepay.io")) {
            if (typeof init?.body === "string") {
              infinitePayBodies.push(JSON.parse(init.body));
            }
            return jsonResponse({ checkout_url: checkoutUrl });
          }

          throw new Error(`fetch inesperado: ${url}`);
        },
      );

      ({ prisma } = await import("../src/lib/prisma"));
      ({ submitAdminOrder } = await import("../src/lib/admin-new-order"));
      ({ quoteShipping } = await import("../src/app/cart/actions"));

      const category = await prisma.category.create({
        data: { slug: runId.toLowerCase(), name: runId },
      });
      categoryId = category.id;
    });

    after(async () => {
      fetchMock?.mock.restore();

      for (const key of envKeys) {
        const value = savedEnv[key];
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }

      if (!prisma || !categoryId) return;

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

    it("refuses anyone who is not an admin and does not create an order", async () => {
      const product = await createProduct(4, 80);
      const email = `negado-${runId}@example.com`;
      const items = [{ productId: product.id, quantity: 1 }];

      const anonymous = await submitAdminOrder(
        undefined,
        form({ items, email }),
      );
      const customer = await submitAdminOrder(
        "cliente",
        form({ items, email }),
      );

      assert.equal(anonymous.status, "error");
      assert.equal(anonymous.message, "Acesso negado.");
      assert.equal(anonymous.orderId, null);
      assert.equal(customer.status, "error");
      assert.equal(customer.message, "Acesso negado.");
      assert.equal(await stockOf(product.id), 4);
      assert.equal(
        await prisma.order.count({ where: { customerEmail: email } }),
        0,
      );
    });

    it("does not create an order without an address", async () => {
      const product = await createProduct(3, 50);
      const email = `sem-endereco-${runId}@example.com`;

      const result = await submitAdminOrder(
        "admin",
        form({
          items: [{ productId: product.id, quantity: 1 }],
          email,
          street: "",
          number: "",
          neighborhood: "",
          city: "",
          state: "",
          postalCode: "",
        }),
      );

      assert.equal(result.status, "error");
      assert.equal(result.orderId, null);
      assert.ok(result.fieldErrors.street);
      assert.ok(result.fieldErrors.postalCode);
      assert.equal(await stockOf(product.id), 3);
      assert.equal(
        await prisma.order.count({ where: { customerEmail: email } }),
        0,
      );
    });

    it("stores the source, the frozen price, the stock decrement and expiresAt", async () => {
      const first = await createProduct(5, 1190.5);
      const second = await createProduct(3, 99.9);
      const email = `origem-${runId}@example.com`;

      const result = await submitAdminOrder(
        "admin",
        form({
          items: [
            { productId: first.id, quantity: 2 },
            { productId: second.id, quantity: 1 },
          ],
          email,
          source: "WHATSAPP",
          shippingServiceId: "0",
        }),
      );

      assert.equal(result.status, "success");
      assert.ok(result.orderId);

      const order = await prisma.order.findUniqueOrThrow({
        where: { id: result.orderId },
        include: { items: { orderBy: { productId: "asc" } } },
      });

      assert.equal(order.source, "WHATSAPP");
      assert.equal(Number(order.subtotal), 2480.9);
      assert.equal(Number(order.total), 2480.9);
      assert.equal(order.items[0]?.quantity, 2);
      assert.equal(Number(order.items[0]?.unitPrice), 1190.5);
      assert.equal(order.items[1]?.quantity, 1);
      assert.equal(Number(order.items[1]?.unitPrice), 99.9);
      assert.equal(await stockOf(first.id), 3);
      assert.equal(await stockOf(second.id), 2);
      assert.ok(order.expiresAt);
      const drift = Math.abs(
        order.expiresAt.getTime() - calculateExpiresAt(new Date()).getTime(),
      );
      assert.ok(drift < 60_000);
    });

    it("charges the same shipping as the customer checkout", async () => {
      const product = await createProduct(4, 200);
      const items = [{ productId: product.id, quantity: 2 }];
      const preview = await quoteShipping(address.postalCode, items);
      const option = preview.quote?.options.find(
        (entry) => entry.serviceId !== localPickupOption.serviceId,
      );

      assert.equal(preview.status, "success");
      assert.ok(option);

      const result = await submitAdminOrder(
        "admin",
        form({
          items,
          email: `frete-${runId}@example.com`,
          shippingServiceId: String(option.serviceId),
          source: "INSTAGRAM",
        }),
      );

      assert.equal(result.status, "success");
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: result.orderId ?? 0 },
      });

      assert.equal(Number(order.shipping), option.price);
      assert.equal(order.deliveryDays, option.deliveryDays);
      assert.equal(Number(order.total), 400 + option.price);
    });

    it("accepts local pickup without a carrier charge", async () => {
      const product = await createProduct(2, 150);
      const items = [{ productId: product.id, quantity: 1 }];
      const preview = await quoteShipping(address.postalCode, items);
      const pickup = preview.quote?.options.find(
        (entry) => entry.serviceId === localPickupOption.serviceId,
      );

      assert.equal(pickup?.price, 0);

      const result = await submitAdminOrder(
        "admin",
        form({
          items,
          email: `retirada-${runId}@example.com`,
          shippingServiceId: "0",
          source: "SITE",
        }),
      );

      assert.equal(result.status, "success");
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: result.orderId ?? 0 },
      });

      assert.equal(Number(order.shipping), 0);
      assert.equal(order.shippingService, localPickupOption.name);
      assert.equal(order.deliveryDays, null);
      assert.equal(order.source, "SITE");
    });

    it("stores a valid InfinitePay checkout link for the order total", async () => {
      const first = await createProduct(4, 100);
      const second = await createProduct(4, 40);
      infinitePayBodies.length = 0;

      const result = await submitAdminOrder(
        "admin",
        form({
          items: [
            { productId: first.id, quantity: 2 },
            { productId: second.id, quantity: 1 },
          ],
          email: `link-${runId}@example.com`,
          paymentChoice: "link",
          shippingServiceId: "0",
          source: "WHATSAPP",
        }),
      );

      assert.equal(result.status, "success");
      assert.equal(result.checkoutUrl, checkoutUrl);
      assert.equal(isInfinitePayCheckoutUrl(result.checkoutUrl ?? ""), true);

      const order = await prisma.order.findUniqueOrThrow({
        where: { id: result.orderId ?? 0 },
      });

      assert.equal(order.status, "AWAITING_PAYMENT");
      assert.equal(order.checkoutUrl, checkoutUrl);
      assert.equal(Number(order.total), 240);
      const charged = infinitePayBodies[0]?.items?.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      assert.equal(charged, 24000);
      assert.equal(await stockOf(first.id), 2);
      assert.equal(await stockOf(second.id), 3);
    });

    it("marks the order paid outside InfinitePay with the method and the date", async () => {
      const product = await createProduct(2, 80);
      const paidOn = todayInBrazil();

      const result = await submitAdminOrder(
        "admin",
        form({
          items: [{ productId: product.id, quantity: 1 }],
          email: `pago-${runId}@example.com`,
          paymentChoice: "external",
          paymentMethod: "pix",
          paidOn,
          shippingServiceId: "0",
        }),
      );

      assert.equal(result.status, "success");
      assert.equal(result.checkoutUrl, null);

      const order = await prisma.order.findUniqueOrThrow({
        where: { id: result.orderId ?? 0 },
      });

      assert.equal(order.status, "PAID");
      assert.equal(order.paymentMethod, "pix");
      assert.equal(order.paymentTransactionNsu, null);
      assert.equal(
        order.paidAt?.toISOString(),
        new Date(`${paidOn}T00:00:00-03:00`).toISOString(),
      );
      assert.equal(Number(order.paymentAmount), 80);
      assert.equal(Number(order.paidAmount), 80);
      assert.equal(await stockOf(product.id), 1);
    });
  },
);
