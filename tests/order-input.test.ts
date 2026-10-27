import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readCheckoutForm } from "../src/lib/order-input";

function checkoutForm(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    name: "Maria da Silva",
    email: "Maria@Example.com",
    phone: "(11) 91234-5678",
    postalCode: "01310-100",
    street: "Avenida Paulista",
    number: "1000",
    complement: "",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "sp",
    items: JSON.stringify([{ productId: 1, quantity: 2 }]),
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

describe("readCheckoutForm", () => {
  it("normalizes a valid form", () => {
    const { input, fieldErrors } = readCheckoutForm(checkoutForm());

    assert.deepEqual(fieldErrors, {});
    assert.deepEqual(input, {
      items: [{ productId: 1, quantity: 2 }],
      customer: {
        name: "Maria da Silva",
        email: "maria@example.com",
        phone: "11912345678",
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
    });
  });

  it("reports every missing required field", () => {
    const { input, fieldErrors } = readCheckoutForm(new FormData());

    assert.equal(input, null);
    assert.deepEqual(Object.keys(fieldErrors).sort(), [
      "city",
      "email",
      "items",
      "name",
      "neighborhood",
      "number",
      "phone",
      "postalCode",
      "state",
      "street",
    ]);
  });

  it("rejects invalid e-mail, phone, postal code and state", () => {
    const { input, fieldErrors } = readCheckoutForm(
      checkoutForm({
        email: "maria@",
        phone: "123",
        postalCode: "123",
        state: "XX",
      }),
    );

    assert.equal(input, null);
    assert.deepEqual(Object.keys(fieldErrors).sort(), [
      "email",
      "phone",
      "postalCode",
      "state",
    ]);
  });

  it("rejects an empty or malformed cart", () => {
    assert.equal(
      readCheckoutForm(checkoutForm({ items: "[]" })).fieldErrors.items,
      "Seu carrinho está vazio.",
    );
    assert.ok(
      readCheckoutForm(checkoutForm({ items: "not json" })).fieldErrors.items,
    );
  });

  it("limits field lengths", () => {
    const { fieldErrors } = readCheckoutForm(
      checkoutForm({ name: "a".repeat(161), complement: "b".repeat(81) }),
    );

    assert.ok(fieldErrors.name);
    assert.ok(fieldErrors.complement);
  });
});
