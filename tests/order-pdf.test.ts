import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PDFDocument } from "pdf-lib";
import {
  buildOrderPdfModel,
  orderPdfDenial,
  orderPdfDenialMessage,
  orderPdfFilename,
  orderPdfPaidTotal,
  orderPdfPayment,
  orderPdfTitle,
} from "../src/lib/order-pdf";
import { renderOrderPdf } from "../src/lib/order-pdf-render";
import { paidOrderStatuses } from "../src/lib/order-status";
import type { IAdminOrderDetail } from "../src/types/admin-order";
import { currencyFormat } from "../src/views/AdminOrdersView/components/order-display";

function sampleOrder(
  overrides: {
    order?: Partial<IAdminOrderDetail>;
    payment?: Partial<IAdminOrderDetail["payment"]>;
    customer?: Partial<IAdminOrderDetail["customer"]>;
    address?: Partial<IAdminOrderDetail["address"]>;
  } = {},
): IAdminOrderDetail {
  return {
    id: 42,
    status: "PAID",
    source: "SITE",
    customer: {
      name: "Maria da Silva",
      email: "maria@example.com",
      phone: "11912345678",
      kind: "PERSON",
      document: "11144477735",
      ...overrides.customer,
    },
    address: {
      postalCode: "01310100",
      street: "Avenida Paulista",
      number: "1000",
      complement: "Sala 12",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      ...overrides.address,
    },
    items: [
      {
        id: 1,
        productId: 7,
        name: "Dry Box",
        sku: "DB-12",
        capacity: "12 filamentos",
        image: "",
        quantity: 2,
        voltage: "V110",
        unitPrice: 1590,
        lineTotal: 3180,
      },
      {
        id: 2,
        productId: null,
        name: "Produto não encontrado ou excluído",
        sku: "",
        capacity: "",
        image: "",
        quantity: 1,
        voltage: null,
        unitPrice: 100,
        lineTotal: 100,
      },
    ],
    itemCount: 3,
    subtotal: 3280,
    shipping: 50,
    shippingService: "Correios · PAC",
    deliveryDays: 7,
    total: 3330,
    trackingCode: null,
    createdAt: new Date("2026-01-01T15:00:00.000Z"),
    updatedAt: new Date("2026-01-02T15:00:00.000Z"),
    expiresAt: null,
    payment: {
      review: false,
      reviewReason: null,
      method: "pix",
      amount: 3166,
      paidAmount: 3166,
      discount: 164,
      installments: null,
      transactionNsu: "nsu",
      invoiceSlug: "fatura",
      paidAt: new Date("2026-11-26T15:00:00.000Z"),
      receiptUrl: null,
      checkoutUrl: null,
      ...overrides.payment,
    },
    ...overrides.order,
  };
}

describe("order pdf model", () => {
  it("maps the paid order into the production sheet", () => {
    const model = buildOrderPdfModel(sampleOrder());

    assert.equal(model.id, 42);
    assert.equal(model.title, orderPdfTitle);
    assert.equal(model.title, "Pedido");
    assert.equal(model.companyName, "NIX 3D");
    assert.equal(model.customer.name, "Maria da Silva");
    assert.equal(
      model.customer.address,
      "Avenida Paulista, 1000 — Sala 12 — Bela Vista",
    );
    assert.equal(model.customer.city, "São Paulo");
    assert.equal(model.customer.state, "SP");
    assert.equal(model.customer.postalCode, "01310-100");
    assert.equal(model.customer.phone, "(11) 91234-5678");
    assert.equal(model.details.date, "26/11/2026");
    assert.equal(model.details.document, "111.444.777-35");
    assert.equal(model.details.representative, "");
    assert.equal(model.details.orderNumber, "42");
    assert.deepEqual(
      model.items.map((item) => item.description),
      ["Dry Box · 12 filamentos · 110V", "Produto não encontrado ou excluído"],
    );
    assert.equal(model.items[0].quantity, 2);
    assert.equal(model.items[0].unitPrice, currencyFormat.format(1590));
    assert.equal(model.items[0].lineTotal, currencyFormat.format(3180));
    assert.equal(model.totals.subtotal, currencyFormat.format(3280));
    assert.equal(model.totals.discount, currencyFormat.format(164));
    assert.equal(model.totals.shipping, currencyFormat.format(50));
    assert.equal(model.totals.total, currencyFormat.format(3166));
    assert.equal(model.payment, "pix");
    assert.equal(JSON.stringify(model).includes("maria@example.com"), false);
    assert.equal(JSON.stringify(model).includes("SITE"), false);
  });

  it("uses the payment date in America/Sao_Paulo, not the creation date", () => {
    const model = buildOrderPdfModel(
      sampleOrder({
        payment: { paidAt: new Date("2026-11-26T02:30:00.000Z") },
      }),
    );

    assert.equal(model.details.date, "25/11/2026");
  });

  it("leaves the date and document blank when the order does not have them", () => {
    const model = buildOrderPdfModel(
      sampleOrder({
        customer: { kind: null, document: null },
        payment: { paidAt: null },
      }),
    );

    assert.equal(model.details.date, "");
    assert.equal(model.details.document, "");
  });

  it("formats a company document and drops an empty complement", () => {
    const model = buildOrderPdfModel(
      sampleOrder({
        customer: { kind: "COMPANY", document: "11222333000181" },
        address: { complement: "", neighborhood: "" },
      }),
    );

    assert.equal(model.details.document, "11.222.333/0001-81");
    assert.equal(model.customer.address, "Avenida Paulista, 1000");
  });

  it("adds the voltage only when the item has one", () => {
    const order = sampleOrder();
    order.items = [
      {
        ...order.items[0],
        voltage: null,
        capacity: "24 filamentos",
      },
      {
        ...order.items[1],
        name: "Cabine",
        capacity: "",
        voltage: "V220",
      },
    ];

    const model = buildOrderPdfModel(order);

    assert.deepEqual(
      model.items.map((item) => item.description),
      ["Dry Box · 24 filamentos", "Cabine · 220V"],
    );
  });

  it("keeps the two blank total cells when there is no pix discount", () => {
    const model = buildOrderPdfModel(
      sampleOrder({
        payment: { discount: 0, method: "credit_card", installments: 1 },
      }),
    );

    assert.equal(model.totals.discount, null);
    assert.equal(model.totals.total, currencyFormat.format(3330));
    assert.equal(orderPdfPaidTotal(sampleOrder({ payment: { discount: null } })), 3330);
  });

  it("shows an em dash when shipping was never quoted", () => {
    const order = sampleOrder();
    order.shipping = null;
    assert.equal(buildOrderPdfModel(order).totals.shipping, "—");
  });

  it("marks the payment option that matches the order", () => {
    assert.equal(orderPdfPayment("pix", null), "pix");
    assert.equal(orderPdfPayment("credit_card", 3), "credit_3x");
    assert.equal(orderPdfPayment("credit_card", 1), "credit");
    assert.equal(orderPdfPayment("credit_card", null), "credit");
    assert.equal(orderPdfPayment("credit_card", 12), "credit");
    assert.equal(orderPdfPayment(null, null), null);
  });

  it("names the file pedido-<id>.pdf", () => {
    assert.equal(orderPdfFilename(42), "pedido-42.pdf");
  });

  it("allows only paid statuses and explains the others", () => {
    for (const status of paidOrderStatuses) {
      assert.equal(orderPdfDenial(status), null);
    }

    assert.equal(
      orderPdfDenial("AWAITING_PAYMENT"),
      orderPdfDenialMessage.AWAITING_PAYMENT,
    );
    assert.equal(
      orderPdfDenial("CANCELLED"),
      "Não é possível gerar o PDF de um pedido cancelado.",
    );
    assert.equal(
      orderPdfDenial("EXPIRED"),
      "Não é possível gerar o PDF de um pedido expirado.",
    );
  });
});

describe("order pdf file", () => {
  it("renders one A4 portrait page for a typical order", async () => {
    const bytes = await renderOrderPdf(buildOrderPdfModel(sampleOrder()));
    const pdf = await PDFDocument.load(bytes);

    assert.equal(pdf.getPageCount(), 1);
    const { width, height } = pdf.getPage(0).getSize();
    assert.ok(Math.abs(width - 595.28) < 0.02);
    assert.ok(Math.abs(height - 841.89) < 0.02);
    assert.equal(Buffer.from(bytes.subarray(0, 5)).toString(), "%PDF-");
  });

  it("continues on another page when the items do not fit", async () => {
    const order = sampleOrder();
    order.items = Array.from({ length: 40 }, (_, index) => ({
      id: index + 1,
      productId: index + 1,
      name: `Peça de produção com nome longo ${index + 1}`,
      sku: `SKU-${index}`,
      capacity: "48 filamentos",
      image: "",
      quantity: index + 1,
      voltage: index % 2 === 0 ? ("V220" as const) : null,
      unitPrice: 10,
      lineTotal: 10 * (index + 1),
    }));

    const bytes = await renderOrderPdf(buildOrderPdfModel(order));
    const pdf = await PDFDocument.load(bytes);

    assert.ok(pdf.getPageCount() > 1);
  });
});
