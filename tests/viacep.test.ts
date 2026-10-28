import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import {
  checkAddressPostalCode,
  lookupPostalCode,
  normalizePlace,
  viaCepBaseUrl,
} from "../src/lib/viacep";

function mockFetch(implementation: (url: string) => Promise<Response>) {
  return mock.method(globalThis, "fetch", (input: string | URL | Request) =>
    implementation(String(input)),
  );
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const paulista = {
  cep: "01310-100",
  logradouro: "Avenida Paulista",
  complemento: "de 612 a 1510 - lado par",
  bairro: "Bela Vista",
  localidade: "São Paulo",
  uf: "SP",
};

describe("lookupPostalCode", () => {
  afterEach(() => mock.restoreAll());

  it("returns the address for a valid postal code", async () => {
    const fetchMock = mockFetch(async () => jsonResponse(paulista));

    const result = await lookupPostalCode("01310-100");

    assert.equal(result.status, "success");
    assert.equal(result.reason, null);
    assert.deepEqual(result.address, {
      postalCode: "01310100",
      street: "Avenida Paulista",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    });
    assert.equal(fetchMock.mock.callCount(), 1);
    assert.equal(
      fetchMock.mock.calls[0].arguments[0],
      `${viaCepBaseUrl}/01310100/json/`,
    );
  });

  it("accepts a postal code that is unique to a city", async () => {
    mockFetch(async () =>
      jsonResponse({
        cep: "13990-000",
        logradouro: "",
        bairro: "",
        localidade: "Espírito Santo do Pinhal",
        uf: "SP",
      }),
    );

    const result = await lookupPostalCode("13990000");

    assert.equal(result.status, "success");
    assert.equal(result.address?.street, "");
    assert.equal(result.address?.city, "Espírito Santo do Pinhal");
  });

  it("rejects an invalid postal code without calling the service", async () => {
    const fetchMock = mockFetch(async () => jsonResponse(paulista));

    for (const value of [
      "",
      "123",
      "0131010",
      "abcdefgh",
      null,
      undefined,
      1,
    ]) {
      const result = await lookupPostalCode(value);

      assert.equal(result.status, "error");
      assert.equal(result.reason, "invalid");
      assert.equal(result.address, null);
    }

    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("reports a postal code that does not exist", async () => {
    mockFetch(async () => jsonResponse({ erro: true }));
    const missing = await lookupPostalCode("99999999");

    assert.equal(missing.status, "error");
    assert.equal(missing.reason, "not-found");
    assert.match(missing.message, /não encontrado/);

    mockFetch(async () => jsonResponse({ erro: "true" }));
    assert.equal((await lookupPostalCode("99999999")).reason, "not-found");
  });

  it("reports a network failure", async () => {
    mockFetch(async () => {
      throw new TypeError("fetch failed");
    });

    const result = await lookupPostalCode("01310100");

    assert.equal(result.status, "error");
    assert.equal(result.reason, "unavailable");
  });

  it("reports a timeout", async () => {
    mockFetch(async () => {
      throw new DOMException("The operation timed out.", "TimeoutError");
    });

    assert.equal((await lookupPostalCode("01310100")).reason, "unavailable");
  });

  it("passes a timeout signal to fetch", async () => {
    const fetchMock = mock.method(
      globalThis,
      "fetch",
      async (_input: string | URL | Request, init?: RequestInit) => {
        assert.ok(init?.signal instanceof AbortSignal);
        return jsonResponse(paulista);
      },
    );

    await lookupPostalCode("01310100");

    assert.equal(fetchMock.mock.callCount(), 1);
  });

  it("reports an error status from the service", async () => {
    mockFetch(async () => new Response("Bad Request", { status: 400 }));
    assert.equal((await lookupPostalCode("01310100")).reason, "unavailable");

    mockFetch(async () => new Response("", { status: 503 }));
    assert.equal((await lookupPostalCode("01310100")).reason, "unavailable");
  });

  it("reports a response that is not the expected JSON", async () => {
    mockFetch(async () => new Response("<html>oops</html>", { status: 200 }));
    assert.equal((await lookupPostalCode("01310100")).reason, "unavailable");

    mockFetch(async () => jsonResponse(null));
    assert.equal((await lookupPostalCode("01310100")).reason, "unavailable");

    mockFetch(async () => jsonResponse({ localidade: "São Paulo", uf: "São" }));
    assert.equal((await lookupPostalCode("01310100")).reason, "unavailable");
  });
});

describe("checkAddressPostalCode", () => {
  afterEach(() => mock.restoreAll());

  const address = { postalCode: "01310100", city: "São Paulo", state: "SP" };

  it("accepts an address that matches the postal code", async () => {
    mockFetch(async () => jsonResponse(paulista));

    const result = await checkAddressPostalCode(address);

    assert.equal(result.status, "valid");
    assert.equal(result.message, "");
    assert.deepEqual(result.fieldErrors, {});
  });

  it("ignores accents, case and extra spaces in the city and the case of the state", async () => {
    mockFetch(async () => jsonResponse(paulista));

    for (const city of [
      "sao paulo",
      "SÃO PAULO",
      "  São   Paulo ",
      "Sao-Paulo",
    ]) {
      const result = await checkAddressPostalCode({
        ...address,
        city,
        state: "sp",
      });
      assert.equal(result.status, "valid", city);
    }
  });

  it("accepts cities with apostrophes and accents on the ViaCEP side", async () => {
    mockFetch(async () =>
      jsonResponse({
        ...paulista,
        localidade: "Santa Bárbara d'Oeste",
        uf: "SP",
      }),
    );

    const result = await checkAddressPostalCode({
      postalCode: "13450000",
      city: "santa barbara d oeste",
      state: "SP",
    });

    assert.equal(result.status, "valid");
  });

  it("refuses a city that does not match the postal code", async () => {
    mockFetch(async () => jsonResponse(paulista));

    const result = await checkAddressPostalCode({
      ...address,
      city: "Campinas",
    });

    assert.equal(result.status, "mismatch");
    assert.deepEqual(Object.keys(result.fieldErrors), ["city"]);
    assert.match(result.message, /cidade informada não confere/);
    assert.match(result.message, /São Paulo\/SP/);
  });

  it("refuses a state that does not match the postal code", async () => {
    mockFetch(async () => jsonResponse(paulista));

    const result = await checkAddressPostalCode({ ...address, state: "RJ" });

    assert.equal(result.status, "mismatch");
    assert.deepEqual(Object.keys(result.fieldErrors), ["state"]);
    assert.match(result.message, /estado informado não confere/);
  });

  it("refuses when both city and state do not match", async () => {
    mockFetch(async () => jsonResponse(paulista));

    const result = await checkAddressPostalCode({
      ...address,
      city: "Niterói",
      state: "RJ",
    });

    assert.equal(result.status, "mismatch");
    assert.deepEqual(Object.keys(result.fieldErrors).sort(), ["city", "state"]);
    assert.match(result.message, /cidade e o estado informados não conferem/);
  });

  it("refuses a postal code that does not exist", async () => {
    mockFetch(async () => jsonResponse({ erro: "true" }));

    const result = await checkAddressPostalCode({
      ...address,
      postalCode: "99999999",
    });

    assert.equal(result.status, "not-found");
    assert.match(result.message, /CEP não encontrado/);
    assert.equal(result.fieldErrors.postalCode, result.message);
  });

  it("accepts the address as given when the network fails", async () => {
    mockFetch(async () => {
      throw new TypeError("fetch failed");
    });

    const result = await checkAddressPostalCode({
      ...address,
      city: "Campinas",
    });

    assert.equal(result.status, "skipped");
    assert.equal(result.message, "");
    assert.deepEqual(result.fieldErrors, {});
  });

  it("accepts the address as given when ViaCEP times out", async () => {
    mockFetch(async () => {
      throw new DOMException("The operation timed out.", "TimeoutError");
    });

    const result = await checkAddressPostalCode(address);

    assert.equal(result.status, "skipped");
  });

  it("accepts the address as given when ViaCEP answers with an error status", async () => {
    mockFetch(async () => jsonResponse({}, 503));

    const result = await checkAddressPostalCode(address);

    assert.equal(result.status, "skipped");
  });

  it("accepts the address as given when the response is not usable", async () => {
    for (const body of [
      new Response("<html>oops</html>", { status: 200 }),
      jsonResponse(null),
      jsonResponse({ ...paulista, uf: "São Paulo" }),
      jsonResponse({ ...paulista, localidade: "" }),
    ]) {
      mockFetch(async () => body);
      const result = await checkAddressPostalCode(address);
      assert.equal(result.status, "skipped");
      mock.restoreAll();
    }
  });
});

describe("normalizePlace", () => {
  it("removes accents, case, punctuation and repeated spaces", () => {
    assert.equal(
      normalizePlace("  São  João d'Aliança "),
      "sao joao d alianca",
    );
    assert.equal(normalizePlace("BRASÍLIA"), "brasilia");
  });
});
