import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  readCategoryForm,
  suggestCategorySlug,
} from "../src/lib/category-input";

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const values: Record<string, string> = {
    name: "Armários Dry Box",
    slug: "armarios",
    sortOrder: "1",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("suggestCategorySlug", () => {
  it("gera um identificador sem acento e com hífens", () => {
    assert.equal(suggestCategorySlug("Armários Dry Box"), "armarios-dry-box");
    assert.equal(suggestCategorySlug("  --Dry Box--  "), "dry-box");
    assert.equal(suggestCategorySlug("A"), "a");
  });
});

describe("readCategoryForm", () => {
  it("aceita nome, identificador e ordem e grava o identificador em minúsculas", () => {
    const parsed = readCategoryForm(form({ slug: "Armarios" }));

    assert.equal(parsed.id, null);
    assert.deepEqual(parsed.fieldErrors, {});
    assert.deepEqual(parsed.input, {
      name: "Armários Dry Box",
      slug: "armarios",
      sortOrder: 1,
    });
  });

  it("na edição lê o id e ignora o identificador enviado", () => {
    const parsed = readCategoryForm(form({ id: "2", slug: "Stations" }));

    assert.equal(parsed.id, 2);
    assert.equal(parsed.input?.slug, null);
    assert.deepEqual(parsed.fieldErrors, {});

    const missing = readCategoryForm(form({ id: "2", slug: "" }));
    const invalid = readCategoryForm(form({ id: "2", slug: "Armários" }));

    assert.equal(missing.input?.slug, null);
    assert.equal(missing.fieldErrors.slug, undefined);
    assert.equal(invalid.input?.slug, null);
    assert.equal(invalid.fieldErrors.slug, undefined);
  });

  it("recusa nome curto, identificador inválido e ordem fora do limite", () => {
    const { input, fieldErrors } = readCategoryForm(
      form({ name: "A", slug: "Armários", sortOrder: "10000" }),
    );

    assert.equal(input, null);
    assert.equal(fieldErrors.name, "Informe o nome da categoria.");
    assert.equal(
      fieldErrors.slug,
      "Use letras minúsculas, números e hífens. Exemplo: armarios.",
    );
    assert.equal(fieldErrors.sortOrder, "Informe uma ordem de 0 a 9999.");
  });

  it("recusa um id que não é inteiro", () => {
    const parsed = readCategoryForm(form({ id: "abc" }));

    assert.equal(Number.isNaN(parsed.id), true);
    assert.equal(parsed.input, null);
    assert.deepEqual(parsed.fieldErrors, {});
  });
});
