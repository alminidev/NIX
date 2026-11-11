import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  readOrderStatusForm,
  trackingCodeMaxLength,
} from "../src/lib/admin-order-input";
import { formatPhone } from "../src/views/AdminOrdersView/components/order-display";

function form(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

describe("readOrderStatusForm", () => {
  it("reads a valid change", () => {
    const result = readOrderStatusForm(form({ id: "12", status: "PAID" }));

    assert.deepEqual(result, {
      input: { id: 12, status: "PAID", trackingCode: null },
      error: null,
    });
  });

  it("trims the tracking code and turns blank into null", () => {
    const withCode = readOrderStatusForm(
      form({ id: "1", status: "SHIPPED", trackingCode: "  BR123-45/A  " }),
    );
    const blank = readOrderStatusForm(
      form({ id: "1", status: "SHIPPED", trackingCode: "   " }),
    );

    assert.equal(withCode.input?.trackingCode, "BR123-45/A");
    assert.equal(blank.input?.trackingCode, null);
  });

  it("rejects an invalid id", () => {
    for (const id of ["", "0", "-1", "abc", "1.5", "99999999999"]) {
      const result = readOrderStatusForm(form({ id, status: "PAID" }));
      assert.equal(result.input, null, id);
      assert.equal(result.error, "Pedido inválido.", id);
    }

    assert.equal(readOrderStatusForm(form({ status: "PAID" })).input, null);
  });

  it("rejects an unknown or missing status", () => {
    assert.equal(
      readOrderStatusForm(form({ id: "1", status: "DONE" })).error,
      "Escolha um status.",
    );
    assert.equal(
      readOrderStatusForm(form({ id: "1" })).error,
      "Escolha um status.",
    );
  });

  it("rejects a long tracking code or one with odd characters", () => {
    const long = readOrderStatusForm(
      form({
        id: "1",
        status: "SHIPPED",
        trackingCode: "A".repeat(trackingCodeMaxLength + 1),
      }),
    );
    const odd = readOrderStatusForm(
      form({ id: "1", status: "SHIPPED", trackingCode: "<b>x</b>" }),
    );

    assert.equal(long.input, null);
    assert.equal(odd.input, null);
  });
});

describe("formatPhone", () => {
  it("formats mobile and landline numbers with area code", () => {
    assert.equal(formatPhone("11912345678"), "(11) 91234-5678");
    assert.equal(formatPhone("1132345678"), "(11) 3234-5678");
  });

  it("returns anything else untouched", () => {
    assert.equal(formatPhone("12345"), "12345");
    assert.equal(formatPhone(""), "");
  });
});
