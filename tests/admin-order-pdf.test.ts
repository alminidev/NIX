import assert from "node:assert/strict";
import { before, beforeEach, describe, it, mock } from "node:test";
import type { OrderStatus } from "../src/generated/prisma/enums";
import { orderPdfDenial } from "../src/lib/order-pdf";
import { paidOrderStatuses } from "../src/lib/order-status";
import type { IAdminOrderDetail } from "../src/types/admin-order";

interface ISessionUser {
  id: string;
  role: string;
  email: string;
  name: string;
}

let session: { user: ISessionUser } | null = null;
let order: IAdminOrderDetail | null = null;
const reads: number[] = [];

function reset() {
  session = null;
  order = null;
  reads.length = 0;
}

mock.module("@/lib/session", {
  namedExports: {
    getSession: async () => session,
  },
});

mock.module("@/lib/admin-orders", {
  namedExports: {
    getAdminOrder: async (id: number) => {
      reads.push(id);
      return order && order.id === id ? order : null;
    },
  },
});

function adminSession(): { user: ISessionUser } {
  return {
    user: {
      id: "admin-1",
      role: "admin",
      email: "admin@admin.com",
      name: "Administrador",
    },
  };
}

function paidOrder(status: OrderStatus): IAdminOrderDetail {
  return {
    id: 42,
    status,
    source: "WHATSAPP",
    customer: {
      name: "Maria da Silva",
      email: "maria@example.com",
      phone: "11912345678",
      kind: "PERSON",
      document: "11144477735",
    },
    address: {
      postalCode: "01310100",
      street: "Avenida Paulista",
      number: "1000",
      complement: "",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    },
    items: [
      {
        id: 1,
        productId: 7,
        name: "Dry Box",
        sku: "DB-12",
        capacity: "12 filamentos",
        image: "",
        quantity: 1,
        voltage: "V110",
        unitPrice: 1590,
        lineTotal: 1590,
      },
    ],
    itemCount: 1,
    subtotal: 1590,
    shipping: 0,
    shippingService: null,
    deliveryDays: null,
    total: 1590,
    trackingCode: null,
    createdAt: new Date("2026-11-01T12:00:00.000Z"),
    updatedAt: new Date("2026-11-01T12:00:00.000Z"),
    expiresAt: null,
    payment: {
      review: false,
      reviewReason: null,
      method: "credit_card",
      amount: 1590,
      paidAmount: 1590,
      discount: 0,
      installments: 3,
      transactionNsu: null,
      invoiceSlug: null,
      paidAt: new Date("2026-11-26T15:00:00.000Z"),
      receiptUrl: null,
      checkoutUrl: null,
    },
  };
}

describe("admin order pdf route", () => {
  let GET: typeof import("../src/app/admin/orders/[id]/pdf/route").GET;

  before(async () => {
    ({ GET } = await import("../src/app/admin/orders/[id]/pdf/route"));
  });

  beforeEach(() => {
    reset();
  });

  function request(id: string) {
    return GET(new Request(`http://localhost/admin/orders/${id}/pdf`), {
      params: Promise.resolve({ id }),
    });
  }

  it("refuses a missing session and a non-admin without reading the order", async () => {
    session = null;
    const anonymous = await request("42");

    session = {
      user: {
        id: "cliente-1",
        role: "cliente",
        email: "cliente@exemplo.com",
        name: "Cliente",
      },
    };
    const customer = await request("42");

    assert.equal(anonymous.status, 403);
    assert.equal(await anonymous.text(), "Acesso negado.");
    assert.equal(customer.status, 403);
    assert.equal(await customer.text(), "Acesso negado.");
    assert.deepEqual(reads, []);
  });

  it("returns 404 for an unknown order and for an id that is not a number", async () => {
    session = adminSession();
    order = null;

    const missing = await request("42");
    const text = await request("abc");
    const zero = await request("0");
    const huge = await request("2147483648");

    assert.equal(missing.status, 404);
    assert.equal(await missing.text(), "Pedido não encontrado.");
    assert.equal(text.status, 404);
    assert.equal(zero.status, 404);
    assert.equal(huge.status, 404);
    assert.deepEqual(reads, [42]);
  });

  it("refuses unpaid statuses on the server", async () => {
    session = adminSession();
    const blocked: OrderStatus[] = ["AWAITING_PAYMENT", "CANCELLED", "EXPIRED"];

    for (const status of blocked) {
      order = paidOrder(status);
      const response = await request("42");
      assert.equal(response.status, 409);
      assert.equal(await response.text(), orderPdfDenial(status));
      assert.equal(response.headers.get("content-type")?.includes("pdf"), false);
    }
  });

  it("downloads pedido-<id>.pdf for every paid status", async () => {
    session = adminSession();

    for (const status of paidOrderStatuses) {
      order = paidOrder(status);
      const response = await request("42");
      const body = Buffer.from(await response.arrayBuffer());

      assert.equal(response.status, 200);
      assert.equal(response.headers.get("content-type"), "application/pdf");
      assert.equal(
        response.headers.get("content-disposition"),
        'attachment; filename="pedido-42.pdf"',
      );
      assert.equal(body.subarray(0, 5).toString(), "%PDF-");
    }
  });
});
