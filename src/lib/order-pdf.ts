import type { OrderStatus } from "@/generated/prisma/enums";
import { maskPostalCode } from "@/lib/cart-input";
import { paidOrderStatuses } from "@/lib/order-status";
import { assuredInstallments } from "@/lib/payment-terms";
import { formatDocument } from "@/lib/tax-id";
import { voltageLabel } from "@/lib/voltage";
import type { IAdminOrderDetail, IAdminOrderItem } from "@/types/admin-order";
import {
  currencyFormat,
  formatPhone,
} from "@/views/AdminOrdersView/components/order-display";

/** Título fixo do PDF. A página do admin continua “Pedido nº {id}”. */
export const orderPdfTitle = "Pedido";

export const orderPdfCompanyName = "NIX 3D";

/**
 * O botão fica desabilitado nestes status. O servidor recusa com o mesmo texto.
 */
export const orderPdfDenialMessage: Partial<Record<OrderStatus, string>> = {
  AWAITING_PAYMENT: "O PDF só pode ser gerado depois que o pedido for pago.",
  CANCELLED: "Não é possível gerar o PDF de um pedido cancelado.",
  EXPIRED: "Não é possível gerar o PDF de um pedido expirado.",
};

export const orderPdfPaymentOptions = [
  { id: "credit", label: "Cartão de Crédito" },
  { id: "credit_3x", label: "Cartão Parcelado 3x sem juros" },
  { id: "pix", label: "À vista - PIX" },
] as const;

export type TOrderPdfPayment = (typeof orderPdfPaymentOptions)[number]["id"];

export interface IOrderPdfModel {
  id: number;
  title: typeof orderPdfTitle;
  companyName: typeof orderPdfCompanyName;
  customer: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  details: {
    /** Data do pagamento, dd/mm/aaaa em Brasília. Vazio sem paidAt. */
    date: string;
    document: string;
    /** O modelo tem o campo; o NIX não tem representante. */
    representative: "";
    orderNumber: string;
  };
  items: Array<{
    quantity: number;
    description: string;
    unitPrice: string;
    lineTotal: string;
  }>;
  totals: {
    subtotal: string;
    /** Null quando não houve desconto de Pix. */
    discount: string | null;
    shipping: string;
    /** Total menos o desconto de Pix: o valor do pedido já com o desconto. */
    total: string;
  };
  payment: TOrderPdfPayment | null;
}

const pdfDateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

export function orderPdfFilename(id: number) {
  return `pedido-${id}.pdf`;
}

/** Null quando o PDF pode ser gerado. */
export function orderPdfDenial(status: OrderStatus) {
  if (paidOrderStatuses.includes(status)) return null;
  return (
    orderPdfDenialMessage[status] ?? "Não é possível gerar o PDF deste pedido."
  );
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/** Total do PDF: o total do pedido menos o desconto de Pix. */
export function orderPdfPaidTotal(
  order: Pick<IAdminOrderDetail, "total" | "payment">,
) {
  const discount = order.payment.discount ?? 0;
  return roundMoney(order.total - Math.max(0, discount));
}

/** Nome, capacidade atual e voltagem do item. Sem voltagem, não inventa o dado. */
export function orderItemPdfDescription(
  item: Pick<IAdminOrderItem, "name" | "capacity" | "voltage">,
) {
  const parts = [item.name.trim()];
  const capacity = item.capacity.trim();
  if (capacity) parts.push(capacity);
  const voltage = voltageLabel(item.voltage);
  if (voltage) parts.push(voltage);
  return parts.join(" · ");
}

export function orderPdfPayment(
  method: string | null,
  installments: number | null,
): TOrderPdfPayment | null {
  if (method === "pix") return "pix";
  if (method === "credit_card") {
    return installments === assuredInstallments ? "credit_3x" : "credit";
  }
  return null;
}

function formatStreet(address: IAdminOrderDetail["address"]) {
  const parts = [`${address.street}, ${address.number}`];
  if (address.complement.trim()) parts.push(address.complement.trim());
  if (address.neighborhood.trim()) parts.push(address.neighborhood.trim());
  return parts.join(" — ");
}

function formatCustomerDocument(customer: IAdminOrderDetail["customer"]) {
  if (!customer.kind || !customer.document) return "";
  return formatDocument(customer.kind, customer.document);
}

function formatShipping(shipping: number | null) {
  if (shipping === null) return "—";
  return currencyFormat.format(shipping);
}

/**
 * Dados que o PDF desenha. E-mail e origem ficam de fora: o modelo não tem
 * esses campos. O bairro entra no endereço, porque a produção precisa dele.
 */
export function buildOrderPdfModel(order: IAdminOrderDetail): IOrderPdfModel {
  const discount = order.payment.discount ?? 0;

  return {
    id: order.id,
    title: orderPdfTitle,
    companyName: orderPdfCompanyName,
    customer: {
      name: order.customer.name,
      address: formatStreet(order.address),
      city: order.address.city,
      state: order.address.state,
      postalCode: maskPostalCode(order.address.postalCode),
      phone: formatPhone(order.customer.phone),
    },
    details: {
      date: order.payment.paidAt ? pdfDateFormat.format(order.payment.paidAt) : "",
      document: formatCustomerDocument(order.customer),
      representative: "",
      orderNumber: String(order.id),
    },
    items: order.items.map((item) => ({
      quantity: item.quantity,
      description: orderItemPdfDescription(item),
      unitPrice: currencyFormat.format(item.unitPrice),
      lineTotal: currencyFormat.format(item.lineTotal),
    })),
    totals: {
      subtotal: currencyFormat.format(order.subtotal),
      discount: discount > 0 ? currencyFormat.format(discount) : null,
      shipping: formatShipping(order.shipping),
      total: currencyFormat.format(orderPdfPaidTotal(order)),
    },
    payment: orderPdfPayment(order.payment.method, order.payment.installments),
  };
}
