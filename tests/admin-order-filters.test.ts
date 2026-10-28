import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  adminOrdersPageSize,
  buildOrdersHref,
  getOrderDateRange,
  hasOrderFilters,
  parseOrderFilters,
  parseOrderIdSearch,
} from "../src/lib/admin-order-filters";
import { paidOrderStatuses } from "../src/lib/order-status";

describe("parseOrderFilters", () => {
  it("returns empty filters and page 1 without params", () => {
    assert.deepEqual(parseOrderFilters({}), {
      q: "",
      status: null,
      from: null,
      to: null,
      page: 1,
    });
  });

  it("reads valid params and trims the search", () => {
    assert.deepEqual(
      parseOrderFilters({
        q: "  maria  ",
        status: "PAID",
        from: "2026-10-01",
        to: "2026-10-27",
        page: "3",
      }),
      {
        q: "maria",
        status: "PAID",
        from: "2026-10-01",
        to: "2026-10-27",
        page: 3,
      },
    );
  });

  it("uses the first value of a repeated param", () => {
    assert.equal(
      parseOrderFilters({ status: ["SHIPPED", "PAID"] }).status,
      "SHIPPED",
    );
  });

  it("ignores an unknown status", () => {
    assert.equal(parseOrderFilters({ status: "paid" }).status, null);
    assert.equal(parseOrderFilters({ status: "DELETE" }).status, null);
  });

  it("ignores malformed or impossible dates", () => {
    for (const value of ["27/10/2026", "2026-13-01", "2026-02-31", "abc", ""]) {
      const filters = parseOrderFilters({ from: value, to: value });
      assert.equal(filters.from, null, value);
      assert.equal(filters.to, null, value);
    }
  });

  it("falls back to page 1 for invalid pages", () => {
    for (const value of ["0", "-2", "1.5", "abc", ""]) {
      assert.equal(parseOrderFilters({ page: value }).page, 1, value);
    }
  });

  it("limits the length of the search", () => {
    assert.equal(parseOrderFilters({ q: "a".repeat(500) }).q.length, 100);
  });
});

describe("getOrderDateRange", () => {
  it("covers whole days in Brasília time, inclusive of the last day", () => {
    const range = getOrderDateRange({
      q: "",
      status: null,
      from: "2026-10-01",
      to: "2026-10-27",
      page: 1,
    });

    assert.equal(range.gte?.toISOString(), "2026-10-01T03:00:00.000Z");
    assert.equal(range.lt?.toISOString(), "2026-10-28T03:00:00.000Z");
  });

  it("handles month and year boundaries and leaves open ends as null", () => {
    const range = getOrderDateRange({
      q: "",
      status: null,
      from: null,
      to: "2026-12-31",
      page: 1,
    });

    assert.equal(range.gte, null);
    assert.equal(range.lt?.toISOString(), "2027-01-01T03:00:00.000Z");
  });
});

describe("parseOrderIdSearch", () => {
  it("reads an order number, with or without #", () => {
    assert.equal(parseOrderIdSearch("42"), 42);
    assert.equal(parseOrderIdSearch(" #42 "), 42);
  });

  it("returns null for text, zero and ids too big for the database", () => {
    for (const value of [
      "maria",
      "12a",
      "0",
      "",
      "99999999999",
      "2147483648",
    ]) {
      assert.equal(parseOrderIdSearch(value), null, value);
    }
    assert.equal(parseOrderIdSearch("2147483647"), 2147483647);
  });
});

describe("buildOrdersHref and hasOrderFilters", () => {
  const filters = parseOrderFilters({
    q: "maria silva",
    status: "PAID",
    from: "2026-10-01",
  });

  it("keeps the filters and only adds the page after the first", () => {
    assert.equal(
      buildOrdersHref(filters, 1),
      "/admin/orders?q=maria+silva&status=PAID&from=2026-10-01",
    );
    assert.equal(
      buildOrdersHref(filters, 3),
      "/admin/orders?q=maria+silva&status=PAID&from=2026-10-01&page=3",
    );
  });

  it("links to the bare page without filters", () => {
    const empty = parseOrderFilters({});
    assert.equal(buildOrdersHref(empty, 1), "/admin/orders");
    assert.equal(hasOrderFilters(empty), false);
    assert.equal(hasOrderFilters(filters), true);
    assert.equal(hasOrderFilters(parseOrderFilters({ page: "4" })), false);
  });
});

describe("order status groups", () => {
  it("counts as revenue only from payment onward", () => {
    assert.deepEqual(paidOrderStatuses, [
      "PAID",
      "IN_PRODUCTION",
      "READY",
      "SHIPPED",
    ]);
  });

  it("uses a sensible page size", () => {
    assert.ok(adminOrdersPageSize >= 10 && adminOrdersPageSize <= 100);
  });
});
