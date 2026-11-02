import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  linkDiscountCents,
  pixCheckoutDiscount,
  pixDiscountPercent,
  productPixDiscountCents,
  resolvePaymentAmount,
} from "../src/lib/payment-terms";

describe("pixCheckoutDiscount", () => {
  it("discounts five percent of the products when there is no shipping", () => {
    const products = 238100;
    const quote = pixCheckoutDiscount(products, products);

    assert.equal(quote.percent, pixDiscountPercent);
    assert.equal(quote.discountCents, productPixDiscountCents(products));
    assert.equal(quote.discountCents, linkDiscountCents(products, pixDiscountPercent));
  });

  it("uses an equivalent percent so shipping stays out of the discount", () => {
    const products = 238100;
    const total = 242610;
    const quote = pixCheckoutDiscount(products, total);

    assert.equal(quote.discountCents, productPixDiscountCents(products));
    assert.ok(quote.percent !== null);
    assert.ok(quote.percent < pixDiscountPercent);
    assert.equal(linkDiscountCents(total, quote.percent), quote.discountCents);
    assert.equal(total - quote.discountCents, 230705);
  });

  it("omits the discount when pix would be charged less than one real", () => {
    const quote = pixCheckoutDiscount(100, 100);
    assert.deepEqual(quote, { percent: null, discountCents: 0 });
  });
});

describe("resolvePaymentAmount", () => {
  const totalCents = 21000;
  const discountCents = 1000;

  it("accepts the original amount and a pix amount reduced only on products", () => {
    assert.deepEqual(
      resolvePaymentAmount({
        method: "credit_card",
        amountCents: totalCents,
        paidAmountCents: totalCents + 300,
        totalCents,
        discountCents,
      }),
      { accepted: true, discountCents: 0 },
    );

    assert.deepEqual(
      resolvePaymentAmount({
        method: "pix",
        amountCents: totalCents - discountCents,
        paidAmountCents: totalCents - discountCents,
        totalCents,
        discountCents,
      }),
      { accepted: true, discountCents },
    );
  });

  it("reads the discount from paid_amount when amount stays at the order total", () => {
    assert.deepEqual(
      resolvePaymentAmount({
        method: "pix",
        amountCents: totalCents,
        paidAmountCents: totalCents - discountCents,
        totalCents,
        discountCents,
      }),
      { accepted: true, discountCents },
    );
  });

  it("rejects a card charged with the pix discount and a pix amount that is too low", () => {
    assert.equal(
      resolvePaymentAmount({
        method: "credit_card",
        amountCents: totalCents - discountCents,
        paidAmountCents: totalCents - discountCents,
        totalCents,
        discountCents,
      }).accepted,
      false,
    );
    assert.equal(
      resolvePaymentAmount({
        method: "pix",
        amountCents: 100,
        paidAmountCents: 100,
        totalCents,
        discountCents,
      }).accepted,
      false,
    );
  });
});
