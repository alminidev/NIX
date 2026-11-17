import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  catalogProductionTime,
  defaultProductionTimeTemplate,
  formatProductionTime,
  parseProductionTimeTemplate,
} from "../src/lib/production-time";
import { readSettingsForm } from "../src/lib/settings-input";

const singular = "Após a compra o tempo de produção do produto é de 1 dia.";
const plural = "Após a compra o tempo de produção do produto é de 5 dias.";

describe("formatProductionTime", () => {
  it("esconde prazo vazio, zero ou negativo", () => {
    for (const days of [null, undefined, 0, -1]) {
      assert.equal(formatProductionTime(days, defaultProductionTimeTemplate), null);
    }
  });

  it("usa o singular em 1 dia e o plural a partir de 2", () => {
    assert.equal(formatProductionTime(1, defaultProductionTimeTemplate), singular);
    assert.equal(formatProductionTime(5, defaultProductionTimeTemplate), plural);
    assert.equal(
      formatProductionTime(2),
      "Após a compra o tempo de produção do produto é de 2 dias.",
    );
  });

  it("respeita um modelo com {dias}, inclusive repetido", () => {
    assert.equal(
      formatProductionTime(5, "Prazo de produção: {dias}."),
      "Prazo de produção: 5 dias.",
    );
    assert.equal(
      formatProductionTime(1, "De {dias} a {dias}."),
      "De 1 dia a 1 dia.",
    );
  });

  it("ainda insere o prazo quando o modelo não tem {dias}", () => {
    assert.equal(formatProductionTime(5, "Produção combinada."), "Produção combinada. 5 dias");
  });

  it("cai no modelo padrão quando o texto vem vazio", () => {
    assert.equal(formatProductionTime(1, "   "), singular);
  });
});

describe("catalogProductionTime", () => {
  it("não leva texto sem prazo e usa o override quando ele existe", () => {
    assert.deepEqual(
      catalogProductionTime(null, null, defaultProductionTimeTemplate),
      { productionDays: null, productionTimeText: null },
    );
    assert.deepEqual(
      catalogProductionTime(0, "Prazo: {dias}.", defaultProductionTimeTemplate),
      { productionDays: 0, productionTimeText: null },
    );
    assert.deepEqual(
      catalogProductionTime(5, null, defaultProductionTimeTemplate),
      { productionDays: 5, productionTimeText: plural },
    );
    assert.deepEqual(
      catalogProductionTime(5, "  ", "Prazo: {dias}."),
      { productionDays: 5, productionTimeText: "Prazo: 5 dias." },
    );
    assert.deepEqual(
      catalogProductionTime(1, "Só este: {dias}.", defaultProductionTimeTemplate),
      { productionDays: 1, productionTimeText: "Só este: 1 dia." },
    );
  });
});

describe("modelo global do tempo de produção", () => {
  it("exige {dias} e aceita o placeholder repetido", () => {
    const empty = new FormData();
    empty.set("productionTimeTemplate", "   ");
    const missing = readSettingsForm(empty);
    assert.equal(missing.input, null);
    assert.match(missing.fieldErrors.productionTimeTemplate ?? "", /\{dias\}/);

    const broken = new FormData();
    broken.set("productionTimeTemplate", "Sem o prazo.");
    assert.equal(readSettingsForm(broken).input, null);
    const repeated = parseProductionTimeTemplate("De {dias} a {dias}.", {
      allowEmpty: false,
    });
    assert.equal(
      "value" in repeated ? repeated.value : null,
      "De {dias} a {dias}.",
    );

    const saved = new FormData();
    saved.set("productionTimeTemplate", "  Prazo de produção: {dias}.  ");
    assert.deepEqual(readSettingsForm(saved), {
      input: { productionTimeTemplate: "Prazo de produção: {dias}." },
      fieldErrors: {},
    });
  });
});
