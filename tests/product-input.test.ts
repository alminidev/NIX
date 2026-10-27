import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readProductForm } from "../src/lib/product-input";

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const values: Record<string, string> = {
    sku: "nix-db12",
    name: "DRY BOX 12",
    categoryId: "1",
    capacity: "12 filamentos",
    dimensionDepth: "46",
    dimensionWidth: "35,5",
    dimensionHeight: "60",
    price: "1.190,00",
    installments: "Até 3x sem juros",
    description: "Compacta e eficiente.",
    sortOrder: "1",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) data.set(key, value);
  data.append("images", "/images/dry-box-12.jpg");
  return data;
}

describe("readProductForm dimensions", () => {
  it("reads depth, width and height as numbers", () => {
    const { input, fieldErrors } = readProductForm(form());

    assert.deepEqual(fieldErrors, {});
    assert.deepEqual(input?.dimensions, { depth: 46, width: 35.5, height: 60 });
  });

  it("rejects a missing or invalid side", () => {
    for (const key of ["dimensionDepth", "dimensionWidth", "dimensionHeight"]) {
      for (const bad of ["", "0", "abc", "-1", "1,25"]) {
        const { input, fieldErrors } = readProductForm(form({ [key]: bad }));

        assert.equal(input, null);
        assert.ok(fieldErrors.dimensions);
      }
    }
  });
});
