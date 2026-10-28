"use server";

import { AppError } from "@/app/_errors/app.error";
import { resolveCart } from "@/lib/cart";
import { parseCartItems, parsePostalCode } from "@/lib/cart-input";
import { readCheckoutForm } from "@/lib/order-input";
import { createOrder, expireOverdueOrders } from "@/lib/orders";
import { calculateShipping } from "@/lib/shipping";
import { formatShippingService } from "@/lib/shipping-display";
import { checkAddressPostalCode, lookupPostalCode } from "@/lib/viacep";
import type { ICartSummary, IShippingResult } from "@/types/cart";
import type { ICheckoutFormState } from "@/types/order";
import type { IPostalCodeLookup } from "@/types/postal-code";
import { updateTag } from "next/cache";

/**
 * Valida os itens do carrinho no servidor e devolve preços, estoque e
 * totais. Devolve null quando a entrada é inválida.
 */
export async function getCartSummary(
  rawItems: unknown,
): Promise<ICartSummary | null> {
  const items = parseCartItems(rawItems);
  if (!items) return null;

  return resolveCart(items);
}

/**
 * Cotação de frete para o CEP informado. O cálculo fica em lib/shipping.ts.
 */
export async function quoteShipping(
  rawPostalCode: unknown,
  rawItems: unknown,
): Promise<IShippingResult> {
  const postalCode = parsePostalCode(rawPostalCode);

  if (!postalCode) {
    return {
      status: "error",
      message: "Informe um CEP com 8 dígitos.",
      quote: null,
    };
  }

  const items = parseCartItems(rawItems);

  if (!items) {
    return {
      status: "error",
      message: "Não foi possível ler o carrinho.",
      quote: null,
    };
  }

  const summary = await resolveCart(items);

  if (summary.lines.length === 0) {
    return {
      status: "error",
      message: "Adicione um produto ao carrinho para calcular o frete.",
      quote: null,
    };
  }

  const quote = await calculateShipping({ postalCode, lines: summary.lines });

  if (quote.status === "error") {
    return {
      status: "error",
      message:
        quote.message ??
        "Não foi possível cotar o frete agora. Tente novamente em instantes.",
      quote,
    };
  }

  if (quote.status === "pending") {
    return {
      status: "success",
      message:
        "CEP recebido. O valor e o prazo do frete serão informados em breve.",
      quote,
    };
  }

  return { status: "success", message: "", quote };
}

function readShippingServiceId(formData: FormData) {
  const raw = formData.get("shippingServiceId");
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return id > 0 ? id : null;
}

/**
 * Endereço do CEP informado, consultado na ViaCEP (lib/viacep.ts).
 */
export async function lookupAddress(
  rawPostalCode: unknown,
): Promise<IPostalCodeLookup> {
  return lookupPostalCode(rawPostalCode);
}

/**
 * Cria o pedido a partir do carrinho e dos dados de entrega. O estoque é
 * baixado na mesma transação que grava o pedido (lib/orders.ts).
 */
export async function placeOrder(
  _previous: ICheckoutFormState,
  formData: FormData,
): Promise<ICheckoutFormState> {
  const parsed = readCheckoutForm(formData);

  if (!parsed.input) {
    return {
      status: "error",
      message: parsed.fieldErrors.items ?? "Revise os campos destacados.",
      fieldErrors: parsed.fieldErrors,
      orderId: null,
    };
  }

  const { items, customer, address } = parsed.input;

  // Confere cidade e UF com o CEP. Se a ViaCEP estiver fora do ar, segue.
  const postalCheck = await checkAddressPostalCode(address);

  if (postalCheck.status === "not-found" || postalCheck.status === "mismatch") {
    return {
      status: "error",
      message: postalCheck.message,
      fieldErrors: postalCheck.fieldErrors,
      orderId: null,
    };
  }

  // Libera o estoque de pedidos vencidos antes de conferir o carrinho.
  if ((await expireOverdueOrders()) > 0) updateTag("products");

  const summary = await resolveCart(items);
  const quote = await calculateShipping({
    postalCode: address.postalCode,
    lines: summary.lines,
    serviceId: readShippingServiceId(formData),
  });

  if (quote.status !== "quoted" || quote.price === null) {
    const message =
      quote.message ??
      "Não foi possível cotar o frete. Tente novamente.";

    return {
      status: "error",
      message,
      fieldErrors: { postalCode: message },
      orderId: null,
    };
  }

  try {
    const order = await createOrder({
      items,
      customer,
      address,
      shipping: quote.price,
      shippingService: formatShippingService(quote.company, quote.serviceName),
      deliveryDays: quote.deliveryDays,
    });

    updateTag("products");

    return {
      status: "success",
      message: "",
      fieldErrors: {},
      orderId: order.id,
    };
  } catch (error) {
    if (error instanceof AppError && error.status === 409) {
      return {
        status: "error",
        message: error.message,
        fieldErrors: {},
        orderId: null,
      };
    }

    throw error;
  }
}
