import assert from "node:assert/strict";
import { afterEach, before, beforeEach, describe, it, mock } from "node:test";
import { calculateTotal } from "../src/lib/cart-calculation";
import { centralDoFreteSetup } from "../src/lib/shipping-central-do-frete";
import {
  formatDeliveryDays,
  formatShippingAmount,
  localPickupFallbackMessage,
  localPickupOption,
  localPickupQuote,
  localPickupServiceId,
  offerLocalPickup,
  presentShippingChoices,
  shippingChoiceLabel,
} from "../src/lib/shipping-display";
import { melhorEnvioSetup } from "../src/lib/shipping-melhor-envio";
import type { IShippingRequest } from "../src/lib/shipping-shared";
import type { ICartLine, IShippingOption, IShippingQuote } from "../src/types/cart";

interface ISettingsRow {
  shippingProvider: string;
}

let settingsRow: ISettingsRow | null = null;
let settingsFailure: Error | null = null;

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      shopSettings: {
        findUnique: async () => {
          if (settingsFailure) throw settingsFailure;
          return settingsRow;
        },
      },
    },
  },
});

let calculateShipping: typeof import("../src/lib/shipping").calculateShipping;
let shippingMessages: typeof import("../src/lib/shipping").shippingMessages;
let quoteOrderShipping: typeof import("../src/lib/checkout-shipping").quoteOrderShipping;

before(async () => {
  ({ calculateShipping, shippingMessages } = await import("../src/lib/shipping"));
  ({ quoteOrderShipping } = await import("../src/lib/checkout-shipping"));
});

const token = "token-secreto";
const envKeys = [
  "MELHOR_ENVIO_TOKEN",
  "MELHOR_ENVIO_BASE_URL",
  "MELHOR_ENVIO_FROM_POSTAL_CODE",
  "MELHOR_ENVIO_USER_AGENT",
  "CENTRAL_DO_FRETE_TOKEN",
  "CENTRAL_DO_FRETE_BASE_URL",
  "CENTRAL_DO_FRETE_FROM_POSTAL_CODE",
  "CENTRAL_DO_FRETE_CARGO_TYPES",
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
    settingsRow = null;
    settingsFailure = null;
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

  it("keeps Melhor Envio when the saved provider is unknown", async () => {
    settingsRow = { shippingProvider: "outro" };
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse([quote()]),
    );

    const result = await calculateShipping(request);

    assert.equal(result.status, "quoted");
    const [url] = fetchMock.mock.calls[0].arguments as [string];
    assert.equal(
      url,
      "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate",
    );
  });

  it("uses Melhor Envio when the shipping column is not in the database yet", async () => {
    const { Prisma } = await import("../src/generated/prisma/client");
    settingsFailure = new Prisma.PrismaClientKnownRequestError(
      "The column shippingProvider does not exist",
      {
        code: "P2022",
        clientVersion: "test",
        meta: { column: "shippingProvider" },
      },
    );
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse([quote()]),
    );

    const result = await calculateShipping(request);

    assert.equal(result.status, "quoted");
    assert.equal(result.price, 42.5);
    const [url] = fetchMock.mock.calls[0].arguments as [string];
    assert.equal(
      url,
      "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate",
    );
  });

  it("does not quote when the shipping provider cannot be read", async () => {
    settingsFailure = new Error(`banco fora ${token}`);
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse([quote()]),
    );

    const result = await calculateShipping(request);

    assert.equal(result.status, "error");
    assert.equal(result.message, shippingMessages.unavailable);
    assert.equal(JSON.stringify(result).includes(token), false);
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

  it("labels local pickup without a delivery estimate and shows it as free", () => {
    assert.equal(shippingChoiceLabel(localPickupOption), "Retirada no local");
    assert.equal(formatShippingAmount(0), "Grátis");
    assert.equal(formatShippingAmount(42.5), "R$\u00a042,50");
  });
});

function quoted(price: number, serviceId = 1): IShippingQuote {
  return {
    status: "quoted",
    price,
    deliveryDays: 9,
    message: null,
    serviceId,
    company: null,
    serviceName: null,
    options: [
      {
        serviceId,
        company: "",
        name: "",
        price,
        deliveryDays: 9,
      },
    ],
  };
}

describe("local pickup", () => {
  it("appends a free pickup option without changing the selected delivery", () => {
    const result = offerLocalPickup(quoted(42.5));

    assert.equal(result.status, "quoted");
    assert.equal(result.price, 42.5);
    assert.equal(result.serviceId, 1);
    assert.deepEqual(
      result.options.map((choice) => [choice.serviceId, choice.price, choice.name]),
      [
        [1, 42.5, ""],
        [localPickupServiceId, 0, "Retirada no local"],
      ],
    );
    assert.equal(calculateTotal(1190.5, result.price), 1233);
  });

  it("keeps the order total unchanged when pickup is selected", () => {
    const result = offerLocalPickup(quoted(42.5), localPickupServiceId);

    assert.equal(result.price, 0);
    assert.equal(result.deliveryDays, null);
    assert.equal(result.serviceId, localPickupServiceId);
    assert.equal(result.options.at(-1)?.name, "Retirada no local");
    assert.equal(calculateTotal(1190.5, result.price), 1190.5);
    assert.deepEqual(localPickupQuote(), {
      status: "quoted",
      price: 0,
      deliveryDays: null,
      message: null,
      serviceId: localPickupServiceId,
      company: null,
      serviceName: null,
      options: [localPickupOption],
    });
  });

  it("offers only free pickup when delivery cannot be quoted", () => {
    const failed: IShippingQuote = {
      status: "error",
      price: null,
      deliveryDays: null,
      message: shippingMessages.uncovered,
      serviceId: null,
      company: null,
      serviceName: null,
      options: [],
    };

    const result = offerLocalPickup(failed);

    assert.equal(result.status, "quoted");
    assert.equal(result.price, 0);
    assert.equal(result.serviceId, localPickupServiceId);
    assert.equal(result.message, localPickupFallbackMessage);
    assert.deepEqual(result.options, [localPickupOption]);
    assert.equal(calculateTotal(1190.5, result.price), 1190.5);
  });

  it("keeps the delivery error when a paid option was selected and the new quote fails", () => {
    const failed: IShippingQuote = {
      status: "error",
      price: null,
      deliveryDays: null,
      message: shippingMessages.unavailable,
      serviceId: null,
      company: null,
      serviceName: null,
      options: [],
    };

    const result = offerLocalPickup(failed, 2);

    assert.equal(result.status, "error");
    assert.equal(result.price, null);
    assert.equal(result.message, shippingMessages.unavailable);
  });
});

const centralToken = "token-central";

function centralPrice(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    shipping_carrier: "Correios",
    price: 42.5,
    delivery_time: 9,
    service_type: null,
    ...overrides,
  };
}

function centralQuote(prices: unknown[], code = "RAMT4RPA") {
  return {
    code,
    expiration: "2026-11-16T20:00:00Z",
    invoice_amount: 2381,
    prices,
  };
}

const orderLine: ICartLine = {
  productId: 1,
  sku: "NIX-DB12",
  name: "Dry Box 12",
  capacity: "12 filamentos",
  image: "",
  dimensions: { width: 35, height: 60, length: 46 },
  weight: 18,
  unitPrice: 1190.5,
  formattedUnitPrice: "",
  quantity: 2,
  maxQuantity: 2,
  lineTotal: 2381,
  formattedLineTotal: "",
};

describe("Central do Frete", () => {
  beforeEach(() => {
    settingsRow = { shippingProvider: "central_do_frete" };
    settingsFailure = null;
    process.env.MELHOR_ENVIO_TOKEN = token;
    process.env.MELHOR_ENVIO_BASE_URL = "https://sandbox.melhorenvio.com.br";
    process.env.MELHOR_ENVIO_FROM_POSTAL_CODE = "01310-100";
    process.env.CENTRAL_DO_FRETE_TOKEN = centralToken;
    process.env.CENTRAL_DO_FRETE_BASE_URL = "https://sandbox.centraldofrete.com";
    process.env.CENTRAL_DO_FRETE_FROM_POSTAL_CODE = "01310-100";
    delete process.env.CENTRAL_DO_FRETE_CARGO_TYPES;
  });

  afterEach(() => {
    mock.restoreAll();
    for (const key of envKeys) {
      const value = savedEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("quotes with the subtotal and volumes and no Bearer prefix", async () => {
    const second = {
      ...request.lines[0],
      sku: "NIX-STATION",
      quantity: 1,
      dimensions: { width: 10.2, height: 8, length: 4 },
      weight: 3,
      unitPrice: 10.25,
    };
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse(centralQuote([centralPrice()])),
    );

    const result = await calculateShipping({
      ...request,
      lines: [...request.lines, second],
    });

    assert.equal(result.status, "quoted");
    assert.equal(result.price, 42.5);
    assert.equal(result.deliveryDays, 9);
    assert.equal(result.serviceId, 1);
    assert.equal(result.company, null);
    assert.equal(result.serviceName, null);
    assert.equal(JSON.stringify(result).includes(centralToken), false);
    assert.equal(JSON.stringify(result).includes("RAMT4RPA"), false);
    assert.equal(JSON.stringify(result).includes("Correios"), false);

    const [url, init] = fetchMock.mock.calls[0].arguments as [string, RequestInit];
    assert.equal(url, "https://sandbox.centraldofrete.com/v1/quotation");
    assert.equal(init.method, "POST");
    const headers = new Headers(init.headers);
    assert.equal(headers.get("authorization"), centralToken);
    assert.equal(headers.get("authorization")?.includes("Bearer"), false);
    assert.equal(headers.get("user-agent"), null);
    assert.deepEqual(JSON.parse(String(init.body)), {
      from: "01310100",
      to: "01018020",
      invoice_amount: 2391.25,
      volumes: [
        {
          quantity: 2,
          width: 35,
          height: 60,
          length: 46,
          weight: 18,
        },
        {
          quantity: 1,
          width: 10.2,
          height: 8,
          length: 4,
          weight: 3,
        },
      ],
    });
  });

  it("sends cargo types when they are configured and omits them otherwise", async () => {
    process.env.CENTRAL_DO_FRETE_CARGO_TYPES = "3, 8";
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse(centralQuote([centralPrice({ id: 9, price: "32.50", delivery_time: "7", service_type: "PAC" })])),
    );

    const result = await calculateShipping(request);

    assert.equal(result.serviceId, 9);
    assert.equal(result.price, 32.5);
    assert.equal(result.deliveryDays, 7);
    const [, init] = fetchMock.mock.calls[0].arguments as [string, RequestInit];
    assert.equal(JSON.parse(String(init.body)).cargo_types[0], 3);
    assert.deepEqual(JSON.parse(String(init.body)).cargo_types, [3, 8]);
  });

  it("keeps the mid-price and the expensive quote, then local pickup", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse(
        centralQuote([
          centralPrice({ id: 1, price: 106.13, delivery_time: 11, service_type: "PAC" }),
          centralPrice({ id: 2, price: 116.26, delivery_time: 4, shipping_carrier: "Jadlog" }),
          centralPrice({ id: 3, price: 142.36, delivery_time: 5, service_type: ".Package" }),
          centralPrice({ id: 4, price: 184.33, delivery_time: 7, service_type: "SEDEX" }),
        ]),
      ),
    );

    const quoted = offerLocalPickup(await calculateShipping(request));

    assert.deepEqual(
      quoted.options.map((choice) => [choice.serviceId, choice.price, choice.deliveryDays, choice.name]),
      [
        [3, 142.36, 11, ""],
        [4, 184.33, 4, ""],
        [localPickupServiceId, 0, 0, "Retirada no local"],
      ],
    );
  });

  it("recalculates the chosen service on the server and skips the carrier for local pickup", async () => {
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse(
        centralQuote([
          centralPrice({ id: 3, price: 142.36, delivery_time: 5 }),
          centralPrice({ id: 4, price: 184.33, delivery_time: 7 }),
        ]),
      ),
    );

    const delivered = await quoteOrderShipping({
      postalCode: request.postalCode,
      lines: [orderLine],
      serviceId: 4,
    });

    assert.equal(delivered.status, "quoted");
    assert.equal(delivered.price, 184.33);
    assert.equal(delivered.deliveryDays, 5);
    assert.equal(delivered.serviceId, 4);
    assert.equal(fetchMock.mock.callCount(), 1);

    const pickup = await quoteOrderShipping({
      postalCode: request.postalCode,
      lines: [orderLine],
      serviceId: localPickupServiceId,
    });

    assert.equal(pickup.price, 0);
    assert.equal(pickup.serviceId, localPickupServiceId);
    assert.equal(fetchMock.mock.callCount(), 1);
  });

  it("maps an uncovered route without exposing the API body", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse(
        {
          error: true,
          message: `Rota secreta ${centralToken}`,
          code: 422,
          reason: "uncovered_route",
        },
        422,
      ),
    );

    const result = await calculateShipping(request);

    assert.equal(result.status, "error");
    assert.equal(result.message, shippingMessages.uncovered);
    assert.equal(JSON.stringify(result).includes(centralToken), false);
    assert.equal(JSON.stringify(result).includes("Rota secreta"), false);
    assert.equal(JSON.stringify(result).includes("uncovered_route"), false);
  });

  it("returns a friendly error on timeout", async () => {
    mock.method(globalThis, "fetch", async () => {
      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    });

    const result = await calculateShipping(request);

    assert.equal(result.message, shippingMessages.timeout);
    assert.equal(result.message?.includes(centralToken), false);
  });

  it("does not call the API when the token or the host is not allowed", async () => {
    delete process.env.CENTRAL_DO_FRETE_TOKEN;
    const missingToken = mock.method(globalThis, "fetch", async () =>
      jsonResponse(centralQuote([centralPrice()])),
    );

    const withoutToken = await calculateShipping(request);

    assert.equal(withoutToken.message, shippingMessages.unavailable);
    assert.equal(missingToken.mock.callCount(), 0);

    mock.restoreAll();
    process.env.CENTRAL_DO_FRETE_TOKEN = centralToken;
    process.env.CENTRAL_DO_FRETE_BASE_URL = "https://evil.example";
    const unexpectedHost = mock.method(globalThis, "fetch", async () =>
      jsonResponse(centralQuote([centralPrice()])),
    );

    const rejectedHost = await calculateShipping(request);

    assert.equal(rejectedHost.status, "error");
    assert.equal(unexpectedHost.mock.callCount(), 0);
    assert.equal(JSON.stringify(rejectedHost).includes(centralToken), false);
  });

  it("does not call the API when cargo types are invalid", async () => {
    process.env.CENTRAL_DO_FRETE_CARGO_TYPES = "abc";
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse(centralQuote([centralPrice()])),
    );

    const result = await calculateShipping(request);

    assert.equal(result.message, shippingMessages.unavailable);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("maps carrier refusals to unavailable without the API body", async () => {
    const cases = [
      { status: 401, reason: "unauthenticated" },
      { status: 403, reason: "account_cannot_quote" },
      { status: 422, reason: "cargo_type_required" },
      { status: 422, reason: "origin_required" },
      { status: 422, reason: "invalid_cargo_type" },
      { status: 422, reason: "destination_required" },
      { status: 422, reason: "quotation_refused" },
      { status: 503, reason: "temporarily_unavailable" },
    ];

    for (const item of cases) {
      mock.restoreAll();
      const secret = `segredo-${item.reason}`;
      mock.method(globalThis, "fetch", async () =>
        jsonResponse(
          { error: true, message: secret, code: 1, reason: item.reason },
          item.status,
        ),
      );

      const result = await calculateShipping(request);

      assert.equal(result.status, "error");
      assert.equal(result.message, shippingMessages.unavailable);
      assert.equal(JSON.stringify(result).includes(secret), false);
      assert.equal(JSON.stringify(result).includes(item.reason), false);
    }
  });

  it("ignores a price whose id is reserved for local pickup", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse(centralQuote([centralPrice({ id: 0, price: 10, delivery_time: 2 })])),
    );

    const result = await calculateShipping(request);

    assert.equal(result.status, "error");
    assert.equal(result.message, shippingMessages.uncovered);
    assert.equal(result.serviceId, null);
  });
});

describe("shipping provider setup", () => {
  it("reports missing Central do Frete variables without their values", () => {
    const setup = centralDoFreteSetup({
      CENTRAL_DO_FRETE_TOKEN: "segredo-super",
      CENTRAL_DO_FRETE_BASE_URL: "https://evil.example",
      CENTRAL_DO_FRETE_CARGO_TYPES: "x",
    });

    assert.equal(setup.ready, false);
    assert.deepEqual(setup.missing, [
      "CENTRAL_DO_FRETE_BASE_URL",
      "CENTRAL_DO_FRETE_FROM_POSTAL_CODE",
      "CENTRAL_DO_FRETE_CARGO_TYPES",
    ]);
    assert.equal(JSON.stringify(setup).includes("segredo-super"), false);
    assert.equal(JSON.stringify(setup).includes("evil.example"), false);
  });

  it("marks a provider ready only when the server can quote", () => {
    assert.deepEqual(
      centralDoFreteSetup({
        CENTRAL_DO_FRETE_TOKEN: "token",
        CENTRAL_DO_FRETE_BASE_URL: "https://api.centraldofrete.com",
        CENTRAL_DO_FRETE_FROM_POSTAL_CODE: "01310-100",
      }),
      { ready: true, missing: [] },
    );
    assert.deepEqual(
      melhorEnvioSetup({
        MELHOR_ENVIO_TOKEN: "token",
        MELHOR_ENVIO_BASE_URL: "http://sandbox.melhorenvio.com.br",
        MELHOR_ENVIO_FROM_POSTAL_CODE: "01310100",
      }),
      { ready: false, missing: ["MELHOR_ENVIO_BASE_URL"] },
    );
  });
});
