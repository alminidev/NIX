import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";
import { calculateTotal } from "../src/lib/cart-calculation";
import {
  calculateShipping,
  shippingMessages,
  type IShippingRequest,
} from "../src/lib/shipping";
import {
  formatDeliveryDays,
  presentShippingChoices,
} from "../src/lib/shipping-display";
import type { IShippingOption } from "../src/types/cart";

const token = "token-secreto";
const envKeys = [
  "MELHOR_ENVIO_TOKEN",
  "MELHOR_ENVIO_BASE_URL",
  "MELHOR_ENVIO_FROM_POSTAL_CODE",
  "MELHOR_ENVIO_USER_AGENT",
] as const;

const savedEnv = Object.fromEntries(
  envKeys.map((key) => [key, process.env[key]]),
);

const request: IShippingRequest = {
  postalCode: "01018020",
  lines: [
    {
      productId: 1,
      sku: "NIX-DB12",
      quantity: 2,
      dimensions: { width: 35, height: 60, length: 46 },
      weight: 18,
      unitPrice: 1190.5,
    },
  ],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function quote(overrides: Record<string, unknown> = {}) {
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

describe("calculateShipping", () => {
  beforeEach(() => {
    process.env.MELHOR_ENVIO_TOKEN = token;
    process.env.MELHOR_ENVIO_BASE_URL = "https://sandbox.melhorenvio.com.br";
    process.env.MELHOR_ENVIO_FROM_POSTAL_CODE = "01310-100";
    process.env.MELHOR_ENVIO_USER_AGENT = "NIX (teste@nix3d.com.br)";
  });

  afterEach(() => {
    mock.restoreAll();
    for (const key of envKeys) {
      const value = savedEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("quotes the mid-price option by default and adds it to the total", async () => {
    const fetchMock = mock.method(
      globalThis,
      "fetch",
      async () =>
        jsonResponse([
          quote({ id: 2, name: "SEDEX", custom_price: "60.00", custom_delivery_time: 3, company: { name: "Correios" } }),
          quote(),
          quote({ id: 3, name: ".Package", error: "Trecho não atendido." }),
        ]),
    );

    const result = await calculateShipping(request);

    assert.equal(result.status, "quoted");
    assert.equal(result.price, 42.5);
    assert.equal(result.deliveryDays, 9);
    assert.equal(result.serviceId, 1);
    assert.equal(result.company, null);
    assert.equal(result.serviceName, null);
    assert.equal(result.message, null);
    assert.deepEqual(
      result.options.map((option) => option.serviceId),
      [1, 2],
    );
    assert.equal(calculateTotal(1190.5, result.price), 1233);
    assert.equal(JSON.stringify(result).includes(token), false);

    assert.equal(fetchMock.mock.callCount(), 1);
    const [url, init] = fetchMock.mock.calls[0].arguments as [
      string,
      RequestInit,
    ];
    assert.equal(
      url,
      "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate",
    );
    const headers = new Headers(init.headers);
    assert.equal(headers.get("authorization"), `Bearer ${token}`);
    assert.equal(headers.get("user-agent"), "NIX (teste@nix3d.com.br)");
    assert.equal(headers.get("accept"), "application/json");
    assert.deepEqual(JSON.parse(String(init.body)), {
      from: { postal_code: "01310100" },
      to: { postal_code: "01018020" },
      products: [
        {
          id: "NIX-DB12",
          width: 35,
          height: 60,
          length: 46,
          weight: 18,
          insurance_value: 1190.5,
          quantity: 2,
        },
      ],
      options: { receipt: false, own_hand: false },
    });
  });

  it("keeps the chosen service when it is still available", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse([
        quote(),
        quote({
          id: 2,
          name: "SEDEX",
          custom_price: "60.00",
          custom_delivery_time: 2,
          company: { name: "Correios" },
        }),
      ]),
    );

    const result = await calculateShipping({ ...request, serviceId: 2 });

    assert.equal(result.serviceId, 2);
    assert.equal(result.price, 60);
    assert.equal(result.deliveryDays, 2);
    assert.equal(result.options.length, 2);
  });

  it("falls back to the mid-price option when the chosen service disappeared", async () => {
    mock.method(globalThis, "fetch", async () => jsonResponse([quote()]));

    const result = await calculateShipping({ ...request, serviceId: 99 });

    assert.equal(result.status, "quoted");
    assert.equal(result.serviceId, 1);
    assert.equal(result.price, 42.5);
  });

  it("charges the mid-price or the expensive quote and stores the promised lead time", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse([
        quote({
          id: 1,
          name: "PAC",
          custom_price: "106.13",
          custom_delivery_time: 11,
          company: { name: "Correios" },
        }),
        quote({
          id: 2,
          name: ".Com",
          custom_price: "116.26",
          custom_delivery_time: 4,
          company: { name: "Jadlog" },
        }),
        quote({
          id: 3,
          name: ".Package",
          custom_price: "142.36",
          custom_delivery_time: 5,
          company: { name: "Jadlog" },
        }),
        quote({
          id: 4,
          name: "SEDEX",
          custom_price: "184.33",
          custom_delivery_time: 7,
          company: { name: "Correios" },
        }),
      ]),
    );

    const standard = await calculateShipping(request);

    assert.equal(standard.serviceId, 3);
    assert.equal(standard.price, 142.36);
    assert.equal(standard.deliveryDays, 11);
    assert.equal(standard.company, null);
    assert.equal(JSON.stringify(standard).includes("Correios"), false);
    assert.equal(JSON.stringify(standard).includes("Jadlog"), false);
    assert.deepEqual(
      standard.options.map((choice) => [choice.serviceId, choice.price, choice.deliveryDays]),
      [
        [3, 142.36, 11],
        [4, 184.33, 4],
      ],
    );

    const express = await calculateShipping({ ...request, serviceId: 4 });

    assert.equal(express.price, 184.33);
    assert.equal(express.deliveryDays, 4);

    const hiddenCheapest = await calculateShipping({ ...request, serviceId: 1 });

    assert.equal(hiddenCheapest.serviceId, 3);
    assert.equal(hiddenCheapest.price, 142.36);
    assert.equal(hiddenCheapest.deliveryDays, 11);
  });

  it("returns a friendly error when every option failed", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse([
        quote({ error: "CEP de destino inválido." }),
        quote({ id: 2, error: "Dimensões acima do limite." }),
      ]),
    );

    const result = await calculateShipping(request);

    assert.equal(result.status, "error");
    assert.equal(result.message, shippingMessages.uncovered);
    assert.equal(result.price, null);
    assert.deepEqual(result.options, []);
    assert.equal(JSON.stringify(result).includes(token), false);
  });

  it("returns a friendly error when the network fails", async () => {
    mock.method(globalThis, "fetch", async () => {
      throw new TypeError("fetch failed");
    });

    const result = await calculateShipping(request);

    assert.equal(result.status, "error");
    assert.equal(result.message, shippingMessages.unavailable);
    assert.equal(result.message?.includes(token), false);
  });

  it("returns a friendly error on timeout", async () => {
    mock.method(globalThis, "fetch", async () => {
      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    });

    const result = await calculateShipping(request);

    assert.equal(result.status, "error");
    assert.equal(result.message, shippingMessages.timeout);
  });

  it("returns a friendly error when the token is rejected", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse({ message: `Unauthenticated ${token}` }, 401),
    );

    const result = await calculateShipping(request);

    assert.equal(result.status, "error");
    assert.equal(result.message, shippingMessages.unavailable);
    assert.equal(result.message?.includes(token), false);
  });

  it("does not call the API when it is not configured", async () => {
    delete process.env.MELHOR_ENVIO_TOKEN;
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse([quote()]),
    );

    const result = await calculateShipping(request);

    assert.equal(result.status, "error");
    assert.equal(result.message, shippingMessages.unavailable);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("does not send the token to an unexpected host", async () => {
    process.env.MELHOR_ENVIO_BASE_URL = "https://evil.example";
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse([quote()]),
    );

    const result = await calculateShipping(request);

    assert.equal(result.status, "error");
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("rejects a product without weight before calling the API", async () => {
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse([quote()]),
    );

    const result = await calculateShipping({
      ...request,
      lines: [{ ...request.lines[0], weight: 0 }],
    });

    assert.equal(result.status, "error");
    assert.equal(result.message, shippingMessages.missingPackage);
    assert.equal(fetchMock.mock.callCount(), 0);
  });
});

function option(
  serviceId: number,
  price: number,
  deliveryDays: number,
  name: string,
): IShippingOption {
  return {
    serviceId,
    company: "Transportadora",
    name,
    price,
    deliveryDays,
  };
}

describe("presentShippingChoices", () => {
  it("keeps the longer lead time on the mid-price option and the shorter on the expensive one", () => {
    const choices = presentShippingChoices([
      option(1, 106.13, 11, "PAC"),
      option(2, 116.26, 4, ".Com"),
      option(3, 142.36, 5, ".Package"),
      option(4, 184.33, 7, "SEDEX"),
    ]);

    assert.deepEqual(
      choices.map((choice) => ({
        serviceId: choice.serviceId,
        price: choice.price,
        deliveryDays: choice.deliveryDays,
        company: choice.company,
        name: choice.name,
      })),
      [
        {
          serviceId: 3,
          price: 142.36,
          deliveryDays: 11,
          company: "",
          name: "",
        },
        {
          serviceId: 4,
          price: 184.33,
          deliveryDays: 4,
          company: "",
          name: "",
        },
      ],
    );
  });

  it("uses the cheaper quote as the standard option when only two prices exist", () => {
    const choices = presentShippingChoices([
      option(2, 60, 3, "SEDEX"),
      option(1, 42.5, 9, "PAC"),
    ]);

    assert.deepEqual(
      choices.map((choice) => [choice.serviceId, choice.price, choice.deliveryDays]),
      [
        [1, 42.5, 9],
        [2, 60, 3],
      ],
    );
  });

  it("returns the only quote when there is a single price", () => {
    const choices = presentShippingChoices([
      option(1, 40, 5, "PAC"),
      option(2, 40, 2, "SEDEX"),
    ]);

    assert.equal(choices.length, 1);
    assert.equal(choices[0].serviceId, 2);
    assert.equal(choices[0].price, 40);
    assert.equal(choices[0].deliveryDays, 5);
  });

  it("ignores the cheapest price when a middle one exists", () => {
    const choices = presentShippingChoices([
      option(1, 40, 4, "PAC"),
      option(2, 50, 8, ".Package"),
      option(3, 80, 7, "SEDEX"),
    ]);

    assert.deepEqual(
      choices.map((choice) => [choice.serviceId, choice.price, choice.deliveryDays]),
      [
        [2, 50, 8],
        [3, 80, 4],
      ],
    );
  });
});

describe("shipping labels", () => {
  it("formats the delivery time", () => {
    assert.equal(formatDeliveryDays(0), "No mesmo dia");
    assert.equal(formatDeliveryDays(1), "1 dia útil");
    assert.equal(formatDeliveryDays(7), "7 dias úteis");
  });
});
