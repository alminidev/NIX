import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateExpiresAt,
  defaultOrderExpirationMinutes,
  getOrderExpirationMinutes,
} from "../src/lib/order-expiration";

describe("getOrderExpirationMinutes", () => {
  it("uses the configured number of minutes", () => {
    assert.equal(getOrderExpirationMinutes("30"), 30);
  });

  it("falls back to the default when missing or invalid", () => {
    for (const value of [undefined, "", "abc", "0", "-5", "1.5"]) {
      assert.equal(
        getOrderExpirationMinutes(value),
        defaultOrderExpirationMinutes,
      );
    }
  });
});

describe("calculateExpiresAt", () => {
  it("adds the minutes to the given date", () => {
    const now = new Date("2026-10-27T12:00:00.000Z");

    assert.equal(
      calculateExpiresAt(now, 90).toISOString(),
      "2026-10-27T13:30:00.000Z",
    );
  });
});
