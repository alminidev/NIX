import { readCheckoutForm } from "@/lib/order-input";
import { readShippingServiceId } from "@/lib/shipping-display";
import type { OrderSource } from "@/generated/prisma/enums";
import type { IAdminOrderFieldErrors } from "@/types/admin-order";
import type { IOrderAddress, IOrderCustomer } from "@/types/order";
import type { ICartItem } from "@/types/cart";

/** Origens que o admin pode gravar. A lista fecha com o enum OrderSource. */
export const adminOrderSources = [
  "SITE",
  "WHATSAPP",
  "INSTAGRAM",
] as const satisfies readonly OrderSource[];

export const externalPaymentMethods = ["pix", "credit_card"] as const;

export type TExternalPaymentMethod = (typeof externalPaymentMethods)[number];

export const externalPaymentMethodLabels: Record<TExternalPaymentMethod, string> =
  {
    pix: "Pix",
    credit_card: "Cartão de crédito",
  };

export type TAdminOrderPayment =
  | { kind: "link" }
  | { kind: "external"; method: TExternalPaymentMethod; paidAt: Date };

export interface IAdminOrderDraft {
  items: ICartItem[];
  customer: IOrderCustomer;
  address: IOrderAddress;
  source: OrderSource;
  /** 0 é a retirada no local */
  serviceId: number;
  payment: TAdminOrderPayment;
}

export interface IParsedAdminOrderForm {
  input: IAdminOrderDraft | null;
  fieldErrors: IAdminOrderFieldErrors;
}

const brazilOffset = "-03:00";

/** Dia civil em Brasília, no formato AAAA-MM-DD. */
export function todayInBrazil(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function isRealDay(value: string) {
  const probe = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(probe.getTime()) && probe.toISOString().slice(0, 10) === value
  );
}

function isSource(value: unknown): value is OrderSource {
  return adminOrderSources.some((source) => source === value);
}

function isPaymentMethod(value: unknown): value is TExternalPaymentMethod {
  return externalPaymentMethods.some((method) => method === value);
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readPayment(
  formData: FormData,
  fieldErrors: IAdminOrderFieldErrors,
  now: Date,
): TAdminOrderPayment | null {
  const choice = formData.get("paymentChoice");

  if (choice === "link") return { kind: "link" };

  if (choice !== "external") {
    fieldErrors.payment = "Escolha como registrar o pagamento.";
    return null;
  }

  const methodRaw = formData.get("paymentMethod");
  const method = isPaymentMethod(methodRaw) ? methodRaw : null;
  if (!method) fieldErrors.paymentMethod = "Escolha a forma de pagamento.";

  const paidOn = readString(formData, "paidOn");
  let paidAt: Date | null = null;

  if (!paidOn || !/^\d{4}-\d{2}-\d{2}$/.test(paidOn) || !isRealDay(paidOn)) {
    fieldErrors.paidAt = "Informe a data do pagamento.";
  } else if (paidOn > todayInBrazil(now)) {
    fieldErrors.paidAt = "A data do pagamento não pode ser no futuro.";
  } else {
    paidAt = new Date(`${paidOn}T00:00:00${brazilOffset}`);
  }

  if (!method || !paidAt) return null;
  return { kind: "external", method, paidAt };
}

/**
 * Lê o formulário de novo pedido do painel. O endereço, o cliente e os itens
 * seguem as mesmas regras do checkout. A origem e o pagamento são do admin.
 */
export function readAdminOrderForm(
  formData: FormData,
  now = new Date(),
): IParsedAdminOrderForm {
  const checkout = readCheckoutForm(formData);
  const fieldErrors: IAdminOrderFieldErrors = { ...checkout.fieldErrors };

  if (fieldErrors.items === "Seu carrinho está vazio.") {
    fieldErrors.items = "Adicione ao menos um produto.";
  }

  const sourceRaw = formData.get("source");
  const source = isSource(sourceRaw) ? sourceRaw : null;
  if (!source) fieldErrors.source = "Escolha a origem do pedido.";

  const serviceId = readShippingServiceId(formData);
  if (serviceId === null && !fieldErrors.postalCode) {
    fieldErrors.postalCode = "Calcule o frete e escolha uma opção.";
  }

  const payment = readPayment(formData, fieldErrors, now);

  if (!checkout.input || !source || serviceId === null || !payment) {
    return { input: null, fieldErrors };
  }

  return {
    input: {
      items: checkout.input.items,
      customer: checkout.input.customer,
      address: checkout.input.address,
      source,
      serviceId,
      payment,
    },
    fieldErrors,
  };
}
