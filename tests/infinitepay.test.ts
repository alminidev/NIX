import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";
import {
  assuredInstallments,
  checkoutMessages,
  createCheckoutLink,
  type ICheckoutOrder,
} from "../src/lib/infinitepay";

const apiKey = "inchk_teste-secreto";
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

const expiresAt = new Date("2026-10-29T15:00:00.000Z");

const order: ICheckoutOrder = {
  id: 12,
  total: 2426.1,
  shipping: 45.1,
  expiresAt,
  customerName: "Maria da Silva",
  customerEmail: "maria@example.com",
  customerPhone: "11912345678",
  postalCode: "01310100",
  street: "Avenida Paulista",
  number: "1000",
  complement: "ap 2",
  neighborhood: "Bela Vista",
  city: "São Paulo",
  state: "SP",
  items: [{ name: "Dry Box", quantity: 2, unitPrice: 1190.5 }],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function checkoutUrl() {
  return "https://checkout.infinitepay.io/nix3d/abc";
}

describe("createCheckoutLink", () => {
  beforeEach(() => {
    process.env.INFINITEPAY_API_KEY = apiKey;
    process.env.INFINITEPAY_HANDLE = "$nix3d";
    process.env.INFINITEPAY_WEBHOOK_SECRET = "segredo webhook";
    process.env.INFINITEPAY_ORDER_PREFIX = "nix";
    process.env.NEXT_PUBLIC_SITE_URL = "https://nix3d.test";
  });

  afterEach(() => {
    mock.restoreAll();
    for (const key of envKeys) {
      const value = savedEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("sends items, shipping, total, order and webhook in cents", async () => {
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse({ checkout_url: checkoutUrl() }),
    );

    const url = await createCheckoutLink(order);

    assert.equal(url, checkoutUrl());
    assert.equal(url.includes(apiKey), false);
    assert.equal(fetchMock.mock.callCount(), 1);

    const [requestUrl, init] = fetchMock.mock.calls[0].arguments as [
      string,
      RequestInit,
    ];
    assert.equal(requestUrl, "https://api.checkout.infinitepay.io/links");
    const headers = new Headers(init.headers);
    assert.equal(headers.get("x-api-key"), apiKey);
    assert.equal(init.signal instanceof AbortSignal, true);

    const body = JSON.parse(String(init.body));
    const sum = body.items.reduce(
      (total: number, item: { price: number; quantity: number }) =>
        total + item.price * item.quantity,
      0,
    );
    assert.equal(sum, 242610);
    assert.deepEqual(body.items, [
      { quantity: 2, price: 119050, description: "Dry Box" },
      { quantity: 1, price: 4510, description: "Frete" },
    ]);
    assert.equal(body.order_nsu, "nix-12");
    assert.equal(body.handle, "nix3d");
    assert.equal(body.redirect_url, "https://nix3d.test/pedido/obrigado");
    assert.equal(body.customer.phone_number, "+5511912345678");
    assert.equal(body.address.cep, "01310100");
    assert.equal(body.address.city, "São Paulo");
    assert.equal(body.options.assured_installments, assuredInstallments);
    assert.equal(body.options.single_payment, true);
    assert.deepEqual(body.options.payment_methods_enabled, [
      "pix",
      "credit_card",
    ]);
    assert.equal(body.options.valid_until, expiresAt.toISOString());
    assert.deepEqual(body.webhook.events, ["paid"]);
    assert.match(body.webhook.url, /\/api\/payments\/infinitepay\/webhook\?/);
    assert.match(body.webhook.url, /token=/);
    assert.equal(JSON.stringify(url).includes(apiKey), false);
  });

  it("omits the webhook on a local http site and omits a zero shipping line", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse({ url: checkoutUrl() }),
    );

    const url = await createCheckoutLink({
      ...order,
      shipping: 0,
      total: 2381,
    });

    assert.equal(url, checkoutUrl());
    const body = JSON.parse(
      String((fetchMock.mock.calls[0].arguments as [string, RequestInit])[1].body),
    );
    assert.equal(body.webhook, undefined);
    assert.equal(body.webhook_url, undefined);
    assert.equal(body.redirect_url, "http://localhost:3000/pedido/obrigado");
    assert.deepEqual(body.items, [
      { quantity: 2, price: 119050, description: "Dry Box" },
    ]);
  });

  it("retries with webhook_url when the new webhook field is rejected", async () => {
    let calls = 0;
    const fetchMock = mock.method(globalThis, "fetch", async () => {
      calls += 1;
      if (calls === 1) {
        return jsonResponse({ success: false, message: "invalid webhook" }, 400);
      }
      return jsonResponse({ link: checkoutUrl() });
    });

    const url = await createCheckoutLink(order);
    assert.equal(url, checkoutUrl());
    assert.equal(fetchMock.mock.callCount(), 2);

    const second = JSON.parse(
      String(
        (fetchMock.mock.calls[1].arguments as [string, RequestInit])[1].body,
      ),
    );
    assert.equal(second.webhook, undefined);
    assert.match(String(second.webhook_url), /^https:\/\/nix3d\.test\//);
    assert.equal(second.webhook_url.includes(apiKey), false);
  });

  it("fails on 4xx, 5xx, timeout and a response without a checkout url", async () => {
    for (const status of [400, 502]) {
      mock.method(globalThis, "fetch", async () =>
        jsonResponse({ message: apiKey }, status),
      );
      await assert.rejects(createCheckoutLink(order), (error: Error) => {
        assert.equal(error.message, checkoutMessages.unavailable);
        assert.equal(error.message.includes(apiKey), false);
        return true;
      });
      mock.restoreAll();
    }

    mock.method(globalThis, "fetch", async () => {
      throw new DOMException("The operation was aborted", "TimeoutError");
    });
    await assert.rejects(
      createCheckoutLink(order),
      (error: Error) => error.message === checkoutMessages.timeout,
    );
    mock.restoreAll();

    mock.method(globalThis, "fetch", async () =>
      jsonResponse({ checkout_url: "https://evil.example/pay" }),
    );
    await assert.rejects(
      createCheckoutLink(order),
      (error: Error) => error.message === checkoutMessages.unavailable,
    );
  });

  it("does not call the api when the key is missing", async () => {
    delete process.env.INFINITEPAY_API_KEY;
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse({ checkout_url: checkoutUrl() }),
    );

    await assert.rejects(
      createCheckoutLink(order),
      (error: Error) => error.message === checkoutMessages.unavailable,
    );
    assert.equal(fetchMock.mock.callCount(), 0);
  });
});
