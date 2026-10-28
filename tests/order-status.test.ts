import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canChangeOrderStatus,
  getNextOrderStatuses,
  getPreviousOrderStatuses,
  orderStatuses,
} from "../src/lib/order-status";

describe("order status changes", () => {
  it("walks the lifecycle one step at a time", () => {
    assert.deepEqual(getNextOrderStatuses("AWAITING_PAYMENT"), [
      "PAID",
      "CANCELLED",
    ]);
    assert.deepEqual(getNextOrderStatuses("PAID"), [
      "IN_PRODUCTION",
      "CANCELLED",
    ]);
    assert.deepEqual(getNextOrderStatuses("IN_PRODUCTION"), ["PAID", "READY"]);
    assert.deepEqual(getNextOrderStatuses("READY"), [
      "IN_PRODUCTION",
      "SHIPPED",
    ]);
    assert.deepEqual(getNextOrderStatuses("SHIPPED"), ["READY"]);
  });

  it("keeps cancelled and expired orders final", () => {
    assert.deepEqual(getNextOrderStatuses("CANCELLED"), []);
    assert.deepEqual(getNextOrderStatuses("EXPIRED"), []);
  });

  it("never offers EXPIRED or a way back to awaiting payment", () => {
    for (const status of orderStatuses) {
      assert.equal(canChangeOrderStatus(status, "EXPIRED"), false);
      assert.equal(canChangeOrderStatus(status, "AWAITING_PAYMENT"), false);
      assert.equal(canChangeOrderStatus(status, status), false);
    }
  });

  it("only cancels before production", () => {
    assert.deepEqual(getPreviousOrderStatuses("CANCELLED"), [
      "AWAITING_PAYMENT",
      "PAID",
    ]);
    assert.equal(canChangeOrderStatus("IN_PRODUCTION", "CANCELLED"), false);
    assert.equal(canChangeOrderStatus("SHIPPED", "CANCELLED"), false);
  });

  it("lists the origins of a status in lifecycle order", () => {
    assert.deepEqual(getPreviousOrderStatuses("PAID"), [
      "AWAITING_PAYMENT",
      "IN_PRODUCTION",
    ]);
    assert.deepEqual(getPreviousOrderStatuses("SHIPPED"), ["READY"]);
    assert.deepEqual(getPreviousOrderStatuses("EXPIRED"), []);
  });
});
