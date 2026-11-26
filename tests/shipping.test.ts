import assert from "node:assert/strict";
import { afterEach, before, beforeEach, describe, it, mock } from "node:test";
import { calculateTotal } from "../src/lib/cart-calculation";
import {
  centralDoFreteServiceId,
  centralDoFreteSetup,
} from "../src/lib/shipping-central-do-frete";
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
import { checkoutFormInitialState } from "../src/types/order";

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
let placeOrder: typeof import("../src/app/cart/actions").placeOrder;

before(async () => {
  ({ calculateShipping, shippingMessages } = await import("../src/lib/shipping"));
  ({ quoteOrderShipping } = await import("../src/lib/checkout-shipping"));
  ({ placeOrder } = await import("../src/app/cart/actions"));
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

function checkoutForm(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    customerKind: "PERSON",
    document: "111.444.777-35",
    name: "Maria da Silva",
    email: "Maria@Example.com",
    phone: "(11) 91234-5678",
    postalCode: "01310-100",
    street: "Avenida Paulista",
    number: "1000",
    complement: "",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    items: JSON.stringify([{ productId: 1, quantity: 2 }]),
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
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

  it("shows one delivery, the most expensive, when every quote shares a deadline", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse([
        quote({
          id: 1,
          name: "PAC",
          custom_price: "40.00",
          custom_delivery_time: 5,
          company: { name: "Correios" },
        }),
        quote({
          id: 2,
          name: "SEDEX",
          custom_price: "80.00",
          custom_delivery_time: 5,
          company: { name: "Jadlog" },
        }),
        quote({
          id: 3,
          name: ".Package",
          custom_price: "55.00",
          custom_delivery_time: 5,
          company: { name: "Azul Cargo" },
        }),
      ]),
    );

    const quoted = offerLocalPickup(await calculateShipping(request));

    assert.deepEqual(
      quoted.options.map((choice) => [
        choice.serviceId,
        choice.price,
        choice.deliveryDays,
        choice.company,
        choice.name,
      ]),
      [
        [2, 80, 5, "", ""],
        [localPickupServiceId, 0, 0, "", "Retirada no local"],
      ],
    );
    assert.equal(JSON.stringify(quoted).includes("Correios"), false);
    assert.equal(JSON.stringify(quoted).includes("Jadlog"), false);
    assert.equal(JSON.stringify(quoted).includes("Azul"), false);
  });

  it("returns delivery options without the carrier name", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse([
        quote({ company: { name: "Correios" } }),
        quote({
          id: 2,
          name: "SEDEX",
          custom_price: "60.00",
          custom_delivery_time: 3,
          company: { name: "Jadlog" },
        }),
      ]),
    );

    const result = await calculateShipping(request);

    assert.equal(result.company, null);
    assert.equal(result.serviceName, null);
    for (const option of result.options) {
      assert.equal(option.company, "");
      assert.equal(option.name, "");
    }
    assert.equal(JSON.stringify(result).includes("Correios"), false);
    assert.equal(JSON.stringify(result).includes("Jadlog"), false);
    assert.equal(JSON.stringify(result).includes("PAC"), false);
    assert.equal(JSON.stringify(result).includes("SEDEX"), false);
  });

  it("rejects a checkout service outside the filtered choices", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse([
        quote({
          id: 1,
          name: "PAC",
          custom_price: "40.00",
          custom_delivery_time: 11,
          company: { name: "Correios" },
        }),
        quote({
          id: 2,
          name: ".Com",
          custom_price: "70.00",
          custom_delivery_time: 6,
          company: { name: "Jadlog" },
        }),
        quote({
          id: 3,
          name: "SEDEX",
          custom_price: "100.00",
          custom_delivery_time: 3,
          company: { name: "Correios" },
        }),
      ]),
    );

    const cart = await calculateShipping({ ...request, serviceId: 1 });

    assert.equal(cart.status, "quoted");
    assert.equal(cart.serviceId, 2);
    assert.equal(cart.price, 70);

    const rejected = await quoteOrderShipping({
      postalCode: request.postalCode,
      lines: [orderLine],
      serviceId: 1,
    });

    assert.equal(rejected.status, "error");
    assert.equal(
      rejected.message,
      "As opções de frete mudaram. Calcule o frete de novo e escolha uma opção.",
    );
    assert.equal(rejected.price, null);
    assert.equal(rejected.serviceId, null);
    assert.deepEqual(rejected.options, []);

    const missing = await quoteOrderShipping({
      postalCode: request.postalCode,
      lines: [orderLine],
      serviceId: null,
    });

    assert.equal(missing.status, "error");
    assert.equal(missing.price, null);
    assert.notEqual(missing.serviceId, localPickupServiceId);
  });

  it("rejects the order when the displayed price or deadline differs", async () => {
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

    const shown = {
      postalCode: request.postalCode,
      lines: [orderLine],
      serviceId: 2,
      displayedPrice: 60,
      displayedDays: 2,
    };

    const matched = await quoteOrderShipping(shown);
    assert.equal(matched.status, "quoted");
    assert.equal(matched.price, 60);
    assert.equal(matched.deliveryDays, 2);
    assert.equal(matched.serviceId, 2);

    const omitted = await quoteOrderShipping({
      postalCode: request.postalCode,
      lines: [orderLine],
      serviceId: 2,
    });
    assert.equal(omitted.status, "quoted");
    assert.equal(omitted.price, 60);

    const stalePrice = await quoteOrderShipping({
      ...shown,
      displayedPrice: 42.5,
    });
    assert.equal(stalePrice.status, "error");
    assert.equal(stalePrice.message, shippingMessages.optionsChanged);
    assert.equal(stalePrice.price, null);
    assert.deepEqual(stalePrice.options, []);

    const staleDays = await quoteOrderShipping({
      ...shown,
      displayedDays: 9,
    });
    assert.equal(staleDays.status, "error");
    assert.equal(staleDays.message, shippingMessages.optionsChanged);
    assert.equal(staleDays.price, null);

    const pickup = await quoteOrderShipping({
      postalCode: request.postalCode,
      lines: [orderLine],
      serviceId: localPickupServiceId,
      displayedPrice: 0,
      displayedDays: 0,
    });
    assert.equal(pickup.status, "quoted");
    assert.equal(pickup.price, 0);

    const stalePickup = await quoteOrderShipping({
      postalCode: request.postalCode,
      lines: [orderLine],
      serviceId: localPickupServiceId,
      displayedPrice: 12,
      displayedDays: 0,
    });
    assert.equal(stalePickup.status, "error");
    assert.equal(stalePickup.message, shippingMessages.optionsChanged);
  });

  it("asks to choose a shipping option when placeOrder has no service id", async () => {
    const fetchMock = mock.method(globalThis, "fetch", async () => {
      throw new Error("não deveria cotar");
    });

    const missing = await placeOrder(checkoutFormInitialState, checkoutForm());
    const blank = await placeOrder(
      checkoutFormInitialState,
      checkoutForm({ shippingServiceId: "" }),
    );

    for (const result of [missing, blank]) {
      assert.equal(result.status, "error");
      assert.equal(result.message, "Escolha uma opção de frete.");
      assert.equal(result.message, shippingMessages.chooseOption);
      assert.notEqual(result.message, shippingMessages.optionsChanged);
      assert.equal(result.fieldErrors.postalCode, "Escolha uma opção de frete.");
      assert.equal(result.orderId, null);
      assert.equal(result.checkoutUrl, null);
    }

    assert.equal(fetchMock.mock.callCount(), 0);
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

  it("returns only the most expensive quote when every deadline matches", () => {
    const choices = presentShippingChoices([
      option(1, 40, 5, "PAC"),
      option(2, 80, 5, "SEDEX"),
      option(3, 60, 5, ".Package"),
    ]);

    assert.deepEqual(
      choices.map((choice) => [choice.serviceId, choice.price, choice.deliveryDays]),
      [[2, 80, 5]],
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

  it("keeps one delivery per deadline, the most expensive, then the mid-price and the expensive", () => {
    const choices = presentShippingChoices([
      option(1, 40, 12, "PAC"),
      option(2, 70, 6, ".Com"),
      option(3, 100, 4, ".Package"),
      option(4, 160, 2, "SEDEX"),
    ]);

    assert.deepEqual(
      choices.map((choice) => [choice.serviceId, choice.price, choice.deliveryDays]),
      [
        [3, 100, 12],
        [4, 160, 2],
      ],
    );
    assert.equal(new Set(choices.map((choice) => choice.deliveryDays)).size, choices.length);
  });

  it("drops the cheaper quote that shares a deadline with a costlier one", () => {
    const choices = presentShippingChoices([
      option(1, 10, 9, "PAC"),
      option(2, 50, 5, ".Com"),
      option(3, 60, 5, ".Package"),
      option(4, 100, 2, "SEDEX"),
    ]);

    assert.deepEqual(
      choices.map((choice) => [choice.serviceId, choice.price, choice.deliveryDays]),
      [
        [3, 60, 9],
        [4, 100, 2],
      ],
    );
  });

  it("keeps the smaller service id when the same deadline ties on price", () => {
    const forward = presentShippingChoices([
      option(8, 50, 4, "PAC"),
      option(3, 50, 4, "SEDEX"),
      option(9, 90, 2, ".Package"),
    ]);
    const reversed = presentShippingChoices([
      option(3, 50, 4, "SEDEX"),
      option(9, 90, 2, ".Package"),
      option(8, 50, 4, "PAC"),
    ]);
    const shown = (choices: IShippingOption[]) =>
      choices.map((choice) => [choice.serviceId, choice.price, choice.deliveryDays]);

    assert.deepEqual(shown(forward), [
      [3, 50, 4],
      [9, 90, 2],
    ]);
    assert.deepEqual(shown(reversed), shown(forward));

    const tied = presentShippingChoices([
      option(8, 50, 4, "PAC"),
      option(3, 50, 4, "SEDEX"),
    ]);

    assert.equal(tied.length, 1);
    assert.equal(tied[0].serviceId, 3);
    assert.equal(tied[0].price, 50);
    assert.equal(tied[0].deliveryDays, 4);
  });

  it("labels the expensive option with the shortest deadline even when that quote is the slowest", () => {
    // A cotação da mais cara leva 12 dias. O rótulo continua sendo o menor
    // prazo, e a intermediária fica com o maior prazo.
    const choices = presentShippingChoices([
      option(1, 40, 3, "PAC"),
      option(2, 70, 5, ".Package"),
      option(3, 120, 12, "SEDEX"),
    ]);

    assert.deepEqual(
      choices.map((choice) => [choice.serviceId, choice.price, choice.deliveryDays]),
      [
        [2, 70, 12],
        [3, 120, 3],
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
  voltage: null,
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
    assert.equal(result.serviceId, centralDoFreteServiceId("Correios", "", ""));
    assert.notEqual(result.serviceId, 1);
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

    assert.equal(result.serviceId, centralDoFreteServiceId("Correios", "PAC", ""));
    assert.notEqual(result.serviceId, 9);
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
    const standard = centralDoFreteServiceId("Correios", ".Package", "");
    const express = centralDoFreteServiceId("Correios", "SEDEX", "");

    assert.notEqual(standard, 3);
    assert.notEqual(express, 4);
    assert.deepEqual(
      quoted.options.map((choice) => [choice.serviceId, choice.price, choice.deliveryDays, choice.name]),
      [
        [standard, 142.36, 11, ""],
        [express, 184.33, 4, ""],
        [localPickupServiceId, 0, 0, "Retirada no local"],
      ],
    );
    for (const choice of quoted.options) {
      assert.equal(choice.company, "");
    }
  });

  it("recalculates the chosen service on the server and skips the carrier for local pickup", async () => {
    const sedex = centralDoFreteServiceId("Correios", "SEDEX", "Aéreo");
    const fetchMock = mock.method(globalThis, "fetch", async () =>
      jsonResponse(
        centralQuote([
          centralPrice({
            id: 31,
            price: 142.36,
            delivery_time: 5,
            service_type: "PAC",
            modal: "Rodoviário",
          }),
          centralPrice({
            id: 47,
            price: 184.33,
            delivery_time: 7,
            service_type: "SEDEX",
            modal: "Aéreo",
          }),
        ]),
      ),
    );

    const delivered = await quoteOrderShipping({
      postalCode: request.postalCode,
      lines: [orderLine],
      serviceId: sedex,
    });

    assert.equal(delivered.status, "quoted");
    assert.equal(delivered.price, 184.33);
    assert.equal(delivered.deliveryDays, 5);
    assert.equal(delivered.serviceId, sedex);
    assert.notEqual(delivered.serviceId, 47);
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

  it("quotes a price whose quotation id is zero with a stable service id", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse(
        centralQuote([
          centralPrice({ id: 0, price: 10, delivery_time: 2, service_type: "PAC" }),
        ]),
      ),
    );

    const result = await calculateShipping(request);

    assert.equal(result.status, "quoted");
    assert.equal(result.price, 10);
    assert.equal(result.deliveryDays, 2);
    assert.equal(result.serviceId, centralDoFreteServiceId("Correios", "PAC", ""));
    assert.notEqual(result.serviceId, 0);
  });

  it("uses max_delivery_time and falls back to delivery_time", async () => {
    let call = 0;
    mock.method(globalThis, "fetch", async () => {
      call += 1;
      if (call === 1) {
        return jsonResponse(
          centralQuote([
            centralPrice({
              price: 42.5,
              delivery_time: 4,
              max_delivery_time: 9,
              service_type: "PAC",
            }),
          ]),
        );
      }

      return jsonResponse(
        centralQuote([
          centralPrice({
            price: 42.5,
            delivery_time: 6,
            max_delivery_time: null,
            service_type: "PAC",
          }),
        ]),
      );
    });

    const withMax = await calculateShipping(request);
    const fallback = await calculateShipping(request);

    assert.equal(withMax.deliveryDays, 9);
    assert.notEqual(withMax.deliveryDays, 4);
    assert.equal(fallback.deliveryDays, 6);
  });

  it("shows the most expensive delivery and local pickup when every deadline matches", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse(
        centralQuote([
          centralPrice({
            id: 11,
            price: 40,
            delivery_time: 2,
            max_delivery_time: 5,
            service_type: "PAC",
            shipping_carrier: "Correios",
          }),
          centralPrice({
            id: 12,
            price: 80,
            delivery_time: 1,
            max_delivery_time: 5,
            service_type: "SEDEX",
            shipping_carrier: "Jadlog",
          }),
          centralPrice({
            id: 13,
            price: 55,
            delivery_time: 4,
            max_delivery_time: 5,
            service_type: ".Package",
            shipping_carrier: "Azul",
          }),
        ]),
      ),
    );

    const quoted = offerLocalPickup(await calculateShipping(request));
    const sedex = centralDoFreteServiceId("Jadlog", "SEDEX", "");

    assert.deepEqual(
      quoted.options.map((choice) => [
        choice.serviceId,
        choice.price,
        choice.deliveryDays,
        choice.company,
        choice.name,
      ]),
      [
        [sedex, 80, 5, "", ""],
        [localPickupServiceId, 0, 0, "", "Retirada no local"],
      ],
    );
    assert.equal(JSON.stringify(quoted).includes("Correios"), false);
    assert.equal(JSON.stringify(quoted).includes("Jadlog"), false);
    assert.equal(JSON.stringify(quoted).includes("Azul"), false);
    assert.equal(JSON.stringify(quoted).includes("SEDEX"), false);
  });

  it("keeps the higher price when two prices are the same service", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse(
        centralQuote([
          centralPrice({
            id: 10,
            price: 40,
            delivery_time: 8,
            service_type: "PAC",
            modal: "Rodoviário",
          }),
          centralPrice({
            id: 11,
            price: 70,
            delivery_time: 2,
            service_type: "PAC",
            modal: "Rodoviário",
          }),
        ]),
      ),
    );

    const higher = await calculateShipping(request);

    assert.equal(higher.options.length, 1);
    assert.equal(higher.price, 70);
    assert.equal(higher.deliveryDays, 2);
    assert.equal(
      higher.serviceId,
      centralDoFreteServiceId("Correios", "PAC", "Rodoviário"),
    );
    assert.notEqual(higher.serviceId, 10);
    assert.notEqual(higher.serviceId, 11);
  });

  it("keeps the first price when the same service ties", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse(
        centralQuote([
          centralPrice({
            id: 10,
            price: 40,
            delivery_time: 8,
            service_type: "PAC",
            modal: "Rodoviário",
          }),
          centralPrice({
            id: 11,
            price: 40,
            delivery_time: 3,
            service_type: "PAC",
            modal: "Rodoviário",
          }),
        ]),
      ),
    );

    const tied = await calculateShipping(request);

    assert.equal(tied.options.length, 1);
    assert.equal(tied.price, 40);
    assert.equal(tied.deliveryDays, 8);
    assert.equal(tied.serviceId, centralDoFreteServiceId("Correios", "PAC", "Rodoviário"));
  });

  it("finds the chosen option again when the quotation id changes", async () => {
    const pac = centralDoFreteServiceId("Correios", "PAC", "Rodoviário");
    const sedex = centralDoFreteServiceId("Correios", "SEDEX", "Aéreo");
    let call = 0;
    mock.method(globalThis, "fetch", async () => {
      call += 1;
      const pacId = call === 1 ? 111 : 908001;
      const sedexId = call === 1 ? 222 : 908002;
      return jsonResponse(
        centralQuote(
          [
            centralPrice({
              id: pacId,
              shipping_carrier: "Correios",
              service_type: "PAC",
              modal: "Rodoviário",
              price: 142.36,
              delivery_time: 5,
              max_delivery_time: 11,
            }),
            centralPrice({
              id: sedexId,
              shipping_carrier: "Correios",
              service_type: "SEDEX",
              modal: "Aéreo",
              price: 184.33,
              delivery_time: 7,
              max_delivery_time: 7,
            }),
          ],
          call === 1 ? "COTACAO1" : "COTACAO2",
        ),
      );
    });

    const cart = await calculateShipping(request);

    assert.equal(cart.status, "quoted");
    assert.equal(cart.serviceId, pac);
    assert.notEqual(cart.serviceId, 111);
    assert.deepEqual(
      cart.options.map((option) => [option.serviceId, option.company, option.name]),
      [
        [pac, "", ""],
        [sedex, "", ""],
      ],
    );
    assert.equal(JSON.stringify(cart).includes("Correios"), false);
    assert.equal(JSON.stringify(cart).includes("COTACAO1"), false);

    const order = await quoteOrderShipping({
      postalCode: request.postalCode,
      lines: [orderLine],
      serviceId: sedex,
    });

    assert.equal(order.status, "quoted");
    assert.equal(order.serviceId, sedex);
    assert.equal(order.price, 184.33);
    assert.equal(order.deliveryDays, 7);
    assert.notEqual(order.serviceId, 222);
    assert.notEqual(order.serviceId, 908002);
    assert.equal(call, 2);
  });

  it("rejects a checkout service outside the filtered choices", async () => {
    const pac = centralDoFreteServiceId("Correios", "PAC", "Rodoviário");
    const jadlog = centralDoFreteServiceId("Jadlog", ".Com", "Rodoviário");
    mock.method(globalThis, "fetch", async () =>
      jsonResponse(
        centralQuote([
          centralPrice({
            id: 501,
            shipping_carrier: "Correios",
            service_type: "PAC",
            modal: "Rodoviário",
            price: 40,
            delivery_time: 12,
            max_delivery_time: 12,
          }),
          centralPrice({
            id: 502,
            shipping_carrier: "Jadlog",
            service_type: ".Com",
            modal: "Rodoviário",
            price: 70,
            delivery_time: 6,
            max_delivery_time: 6,
          }),
          centralPrice({
            id: 503,
            shipping_carrier: "Correios",
            service_type: "SEDEX",
            modal: "Aéreo",
            price: 100,
            delivery_time: 3,
            max_delivery_time: 3,
          }),
        ]),
      ),
    );

    const cart = await calculateShipping({ ...request, serviceId: pac });

    assert.equal(cart.status, "quoted");
    assert.equal(cart.serviceId, jadlog);
    assert.equal(cart.price, 70);
    assert.equal(
      cart.options.some((option) => option.serviceId === pac),
      false,
    );

    const rejected = await quoteOrderShipping({
      postalCode: request.postalCode,
      lines: [orderLine],
      serviceId: pac,
    });

    assert.equal(rejected.status, "error");
    assert.equal(
      rejected.message,
      "As opções de frete mudaram. Calcule o frete de novo e escolha uma opção.",
    );
    assert.equal(rejected.price, null);
    assert.equal(rejected.serviceId, null);
    assert.deepEqual(rejected.options, []);

    const byQuotationId = await quoteOrderShipping({
      postalCode: request.postalCode,
      lines: [orderLine],
      serviceId: 502,
    });

    assert.equal(byQuotationId.status, "error");
    assert.equal(byQuotationId.price, null);
    assert.notEqual(jadlog, 502);
  });

  it("returns delivery options without the carrier name", async () => {
    mock.method(globalThis, "fetch", async () =>
      jsonResponse(
        centralQuote([
          centralPrice({
            shipping_carrier: "Correios",
            service_type: "PAC",
            modal: "Rodoviário",
            price: 40,
            delivery_time: 8,
          }),
          centralPrice({
            id: 2,
            shipping_carrier: "Jadlog",
            service_type: "SEDEX",
            modal: "Aéreo",
            price: 80,
            delivery_time: 3,
          }),
        ]),
      ),
    );

    const result = await calculateShipping(request);

    assert.equal(result.company, null);
    assert.equal(result.serviceName, null);
    for (const option of result.options) {
      assert.equal(option.company, "");
      assert.equal(option.name, "");
    }
    assert.equal(JSON.stringify(result).includes("Correios"), false);
    assert.equal(JSON.stringify(result).includes("Jadlog"), false);
    assert.equal(JSON.stringify(result).includes("PAC"), false);
    assert.equal(JSON.stringify(result).includes("SEDEX"), false);
    assert.equal(JSON.stringify(result).includes("Rodoviário"), false);
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
