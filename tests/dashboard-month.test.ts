import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDashboardHref,
  buildDashboardOrdersHref,
  currentDashboardMonth,
  formatDashboardMonth,
  getDashboardMonthRange,
  parseDashboardMonth,
  shiftDashboardMonth,
} from "../src/lib/dashboard-month";

const now = new Date("2026-11-04T15:00:00-03:00");

describe("parseDashboardMonth", () => {
  it("uses the current month in Brasília when the param is missing", () => {
    assert.deepEqual(parseDashboardMonth({}, now), {
      month: "2026-11",
      label: "Novembro de 2026",
      currentMonth: "2026-11",
    });
  });

  it("keeps the Brasília month when UTC has already rolled over", () => {
    assert.equal(
      currentDashboardMonth(new Date("2026-11-01T02:30:00.000Z")),
      "2026-10",
    );
  });

  it("reads a past month and rejects invalid or future ones", () => {
    assert.equal(parseDashboardMonth({ month: "2026-10" }, now).month, "2026-10");
    assert.equal(parseDashboardMonth({ month: ["2026-09"] }, now).month, "2026-09");

    for (const value of ["2026-13", "novembro", "2026-11-04", ""]) {
      assert.equal(parseDashboardMonth({ month: value }, now).month, "2026-11", value);
    }

    assert.equal(parseDashboardMonth({ month: "2027-01" }, now).month, "2026-11");
  });

  it("shows every month when month=all", () => {
    assert.deepEqual(parseDashboardMonth({ month: "all" }, now), {
      month: null,
      label: null,
      currentMonth: "2026-11",
    });
  });
});

describe("getDashboardMonthRange", () => {
  it("covers the whole month in Brasília, including the year boundary", () => {
    const october = getDashboardMonthRange("2026-10");
    assert.equal(october?.gte.toISOString(), "2026-10-01T03:00:00.000Z");
    assert.equal(october?.lt.toISOString(), "2026-11-01T03:00:00.000Z");

    const december = getDashboardMonthRange("2026-12");
    assert.equal(december?.lt.toISOString(), "2027-01-01T03:00:00.000Z");
    assert.equal(getDashboardMonthRange("2026-13"), null);
  });
});

describe("dashboard month links", () => {
  it("shifts months across the year and builds the dashboard href", () => {
    assert.equal(shiftDashboardMonth("2026-12", 1), "2027-01");
    assert.equal(shiftDashboardMonth("2026-01", -1), "2025-12");
    assert.equal(formatDashboardMonth("2026-11"), "Novembro de 2026");
    assert.equal(buildDashboardHref("2026-10"), "/admin?month=2026-10");
    assert.equal(buildDashboardHref(null), "/admin?month=all");
  });

  it("sends the orders list to the same inclusive month", () => {
    assert.equal(
      buildDashboardOrdersHref("2026-11", { status: "PAID" }),
      "/admin/orders?status=PAID&from=2026-11-01&to=2026-11-30",
    );
    assert.equal(
      buildDashboardOrdersHref("2024-02"),
      "/admin/orders?from=2024-02-01&to=2024-02-29",
    );
    assert.equal(buildDashboardOrdersHref(null), "/admin/orders");
  });
});
