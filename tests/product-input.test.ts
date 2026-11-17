import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { productImageMessages, productImagePublicUrl } from "../src/lib/product-image";
import { readProductForm } from "../src/lib/product-input";

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const values: Record<string, string> = {
    sku: "nix-db12",
    name: "DRY BOX 12",
    categoryId: "1",
    capacity: "12 filamentos",
    dimensionLength: "46",
    dimensionWidth: "35,5",
    dimensionHeight: "60",
    weight: "18,5",
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

describe("readProductForm images", () => {
  const origin = "http://127.0.0.1:54321";

  it("aceita caminho do site e URL do bucket produtos", () => {
    const previous = process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = origin;

    try {
      const site = readProductForm(form());
      assert.equal(site.input?.images[0]?.url, "/images/dry-box-12.jpg");

      const data = form();
      data.delete("images");
      const bucketUrl = productImagePublicUrl(origin, "catalog/dry-box-12.jpg");
      data.append("images", bucketUrl);
      const bucket = readProductForm(data);
      assert.equal(bucket.fieldErrors.images, undefined);
      assert.equal(bucket.input?.images[0]?.url, bucketUrl);
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      else process.env.NEXT_PUBLIC_SUPABASE_URL = previous;
    }
  });

  it("recusa uma URL externa", () => {
    const data = form();
    data.delete("images");
    data.append("images", "https://exemplo.com/a.jpg");
    const { input, fieldErrors } = readProductForm(data);

    assert.equal(input, null);
    assert.equal(fieldErrors.images, productImageMessages.url);
  });
});

describe("readProductForm dimensions", () => {
  it("reads length, width and height as numbers", () => {
    const { input, fieldErrors } = readProductForm(form());

    assert.deepEqual(fieldErrors, {});
    assert.deepEqual(input?.dimensions, { length: 46, width: 35.5, height: 60 });
    assert.equal(input?.weight, 18.5);
  });

  it("rejects a missing or invalid weight", () => {
    for (const bad of ["", "0", "abc", "-1", "1,2345"]) {
      const { input, fieldErrors } = readProductForm(form({ weight: bad }));

      assert.equal(input, null);
      assert.ok(fieldErrors.weight);
    }
  });

  it("reads production days and an optional template", () => {
    const empty = readProductForm(form());
    assert.equal(empty.fieldErrors.productionDays, undefined);
    assert.equal(empty.input?.productionDays, null);
    assert.equal(empty.input?.productionTimeTemplate, null);

    const filled = readProductForm(
      form({
        productionDays: "7",
        productionTimeTemplate: " Prazo: {dias}. ",
      }),
    );
    assert.equal(filled.input?.productionDays, 7);
    assert.equal(filled.input?.productionTimeTemplate, "Prazo: {dias}.");

    const zero = readProductForm(form({ productionDays: "0" }));
    assert.equal(zero.input?.productionDays, 0);
    assert.equal(zero.fieldErrors.productionDays, undefined);
  });

  it("rejects a production time that is not a whole number within the cap", () => {
    for (const bad of ["abc", "-1", "1,5", "1.5", "366", "7 dias"]) {
      const { input, fieldErrors } = readProductForm(
        form({ productionDays: bad }),
      );

      assert.equal(input, null);
      assert.ok(fieldErrors.productionDays);
      assert.equal(fieldErrors.dimensions, undefined);
    }
  });

  it("rejects a product template without {dias}", () => {
    const { input, fieldErrors } = readProductForm(
      form({ productionTimeTemplate: "Sem o prazo." }),
    );

    assert.equal(input, null);
    assert.match(fieldErrors.productionTimeTemplate ?? "", /\{dias\}/);
  });

  it("rejects a missing or invalid side", () => {
    for (const key of ["dimensionLength", "dimensionWidth", "dimensionHeight"]) {
      for (const bad of ["", "0", "abc", "-1", "1,25"]) {
        const { input, fieldErrors } = readProductForm(form({ [key]: bad }));

        assert.equal(input, null);
        assert.ok(fieldErrors.dimensions);
      }
    }
  });
});
