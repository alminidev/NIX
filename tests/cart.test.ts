import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateTotal,
  maxCartQuantity,
  summarizeCart,
  type ICartProductData,
} from "../src/lib/cart-calculation";
import {
  maskPostalCode,
  parseCartItems,
  parsePostalCode,
} from "../src/lib/cart-input";
import {
  formatDimensions,
  parseDimension,
} from "../src/lib/product-dimensions";

function product(
  id: number,
  overrides: Partial<ICartProductData & { active: boolean }> = {},
) {
  return {
    id,
    sku: `NIX-${id}`,
    name: `Produto ${id}`,
    capacity: "12 filamentos",
    image: "/images/x.jpg",
    dimensions: { length: 46, width: 35, height: 60 },
    weight: 18,
    price: 1190,
    stock: 5,
    active: true,
    ...overrides,
  };
}

describe("parseCartItems", () => {
  it("accepts valid items and merges duplicates", () => {
    assert.deepEqual(
      parseCartItems([
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
        { productId: 1, quantity: 3 },
      ]),
      [
        { productId: 1, quantity: 5 },
        { productId: 2, quantity: 1 },
      ],
    );
  });

  it("caps merged quantities at the per-order limit", () => {
    assert.deepEqual(
      parseCartItems([
        { productId: 1, quantity: maxCartQuantity },
        { productId: 1, quantity: 10 },
      ]),
      [{ productId: 1, quantity: maxCartQuantity }],
    );
  });

  it("rejects malformed input", () => {
    for (const bad of [
      null,
      "x",
      {},
      [null],
      [{ productId: "1", quantity: 1 }],
      [{ productId: 1.5, quantity: 1 }],
      [{ productId: 0, quantity: 1 }],
      [{ productId: 1, quantity: 0 }],
      [{ productId: 1, quantity: -2 }],
      [{ productId: 1, quantity: maxCartQuantity + 1 }],
      [{ productId: 1, quantity: Number.NaN }],
      Array.from({ length: 51 }, (_, index) => ({
        productId: index + 1,
        quantity: 1,
      })),
    ]) {
      assert.equal(parseCartItems(bad), null);
    }
  });
});

describe("summarizeCart", () => {
  it("uses the server price and sums in cents", () => {
    const summary = summarizeCart(
      [{ productId: 1, quantity: 3 }],
      new Map([[1, product(1, { price: 0.1 })]]),
    );

    assert.equal(summary.subtotal, 0.3);
    assert.equal(summary.itemCount, 3);
    assert.equal(summary.lines[0].lineTotal, 0.3);
  });

  it("reduces a quantity above the registered stock", () => {
    const summary = summarizeCart(
      [{ productId: 1, quantity: 9 }],
      new Map([[1, product(1, { stock: 4 })]]),
    );

    assert.equal(summary.lines[0].quantity, 4);
    assert.equal(summary.lines[0].maxQuantity, 4);
    assert.equal(summary.subtotal, 4760);
    assert.equal(summary.notices.length, 1);
  });

  it("limits the quantity to the per-order maximum even with large stock", () => {
    const summary = summarizeCart(
      [{ productId: 1, quantity: 50 }],
      new Map([[1, product(1, { stock: 5000 })]]),
    );

    assert.equal(summary.lines[0].maxQuantity, maxCartQuantity);
  });

  it("drops products with no stock, inactive or unknown", () => {
    const summary = summarizeCart(
      [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 1 },
        { productId: 3, quantity: 1 },
        { productId: 4, quantity: 2 },
      ],
      new Map([
        [1, product(1, { stock: 0 })],
        [2, product(2, { active: false })],
        [4, product(4)],
      ]),
    );

    assert.deepEqual(
      summary.lines.map((line) => line.productId),
      [4],
    );
    assert.equal(summary.notices.length, 2);
  });

  it("returns an empty summary for an empty cart", () => {
    const summary = summarizeCart([], new Map());

    assert.equal(summary.lines.length, 0);
    assert.equal(summary.subtotal, 0);
  });
});

describe("calculateTotal", () => {
  it("adds shipping only when there is a quote", () => {
    assert.equal(calculateTotal(100.1, null), 100.1);
    assert.equal(calculateTotal(100.1, 20.2), 120.3);
  });
});

describe("postal code", () => {
  it("accepts 8 digits with or without a hyphen", () => {
    assert.equal(parsePostalCode("01310-100"), "01310100");
    assert.equal(parsePostalCode("01310100"), "01310100");
  });

  it("rejects anything else", () => {
    for (const bad of ["", "1234567", "123456789", "abcdefgh", null, 12345678]) {
      assert.equal(parsePostalCode(bad), null);
    }
  });

  it("masks while typing", () => {
    assert.equal(maskPostalCode("013"), "013");
    assert.equal(maskPostalCode("013101"), "01310-1");
    assert.equal(maskPostalCode("01310100999"), "01310-100");
  });
});

describe("dimensions", () => {
  it("formats the same text the product card always showed", () => {
    assert.equal(
      formatDimensions({ length: 46, width: 35, height: 60 }),
      "46 x 35 x 60 cm",
    );
    assert.equal(
      formatDimensions({ length: 56, width: 60, height: 100 }),
      "56 x 60 x 100 cm",
    );
    assert.equal(
      formatDimensions({ length: 46.5, width: 35, height: 60 }),
      "46,5 x 35 x 60 cm",
    );
  });

  it("parses typed measurements", () => {
    assert.equal(parseDimension("46"), 46);
    assert.equal(parseDimension("46,5"), 46.5);
    assert.equal(parseDimension(" 46.5 "), 46.5);
  });

  it("rejects invalid measurements", () => {
    for (const bad of ["", "0", "-3", "abc", "46,55", "1e3", "100000"]) {
      assert.equal(parseDimension(bad), null);
    }
  });
});
