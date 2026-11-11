import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDocument,
  isValidCnpj,
  isValidCpf,
  maskCnpj,
  maskCpf,
  parseDocument,
} from "../src/lib/tax-id";

describe("tax id", () => {
  it("validates and masks a CPF", () => {
    assert.equal(isValidCpf("111.444.777-35"), true);
    assert.equal(isValidCpf("11144477700"), false);
    assert.equal(isValidCpf("11111111111"), false);
    assert.equal(maskCpf("11144477735"), "111.444.777-35");
    assert.equal(parseDocument("PERSON", "111.444.777-35"), "11144477735");
  });

  it("validates a numeric and an alphanumeric CNPJ", () => {
    assert.equal(isValidCnpj("11.222.333/0001-81"), true);
    assert.equal(isValidCnpj("11222333000180"), false);
    assert.equal(isValidCnpj("00000000000000"), false);
    assert.equal(isValidCnpj("12.ABC.345/01DE-35"), true);
    assert.equal(maskCnpj("12abc34501de35"), "12.ABC.345/01DE-35");
    assert.equal(parseDocument("COMPANY", "12.ABC.345/01DE-35"), "12ABC34501DE35");
    assert.equal(formatDocument("COMPANY", "11222333000181"), "11.222.333/0001-81");
  });
});
