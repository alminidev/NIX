import { AppError } from "@/app/_errors/app.error";
import { readAdminOrderForm } from "@/lib/admin-order-form";
import { resolveCart } from "@/lib/cart";
import { quoteOrderShipping } from "@/lib/checkout-shipping";
import {
  cancelOrder,
  createOrder,
  expireOverdueOrders,
  recordExternalPayment,
} from "@/lib/orders";
import { startCheckout } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import {
  isLocalPickup,
  localPickupOption,
} from "@/lib/shipping-display";
import { checkAddressPostalCode } from "@/lib/viacep";
import type {
  IAdminCustomerOption,
  IAdminOrderFormState,
  IAdminOrderProductOption,
} from "@/types/admin-order";
import type { ICartItem } from "@/types/cart";
import "server-only";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export interface IAdminNewOrderOptions {
  customers: IAdminCustomerOption[];
  products: IAdminOrderProductOption[];
}

export interface IAdminOrderSubmitResult extends IAdminOrderFormState {
  /** Estoque mudou (pedido criado, cancelado ou expiração) e o cache deve ser limpo */
  stockChanged: boolean;
}

function failure(
  message: string,
  fieldErrors: IAdminOrderFormState["fieldErrors"] = {},
  stockChanged = false,
): IAdminOrderSubmitResult {
  return {
    status: "error",
    message,
    fieldErrors,
    orderId: null,
    checkoutUrl: null,
    stockChanged,
  };
}

function quantitiesMatch(
  items: ICartItem[],
  lines: { productId: number; quantity: number }[],
) {
  if (lines.length !== items.length) return false;

  return items.every((item) =>
    lines.some(
      (line) =>
        line.productId === item.productId && line.quantity === item.quantity,
    ),
  );
}

/** Clientes e produtos ativos para o formulário de novo pedido. */
export async function getAdminNewOrderOptions(): Promise<IAdminNewOrderOptions> {
  const [users, recentOrders, products] = await Promise.all([
    prisma.user.findMany({
      where: { OR: [{ role: null }, { role: { not: "admin" } }] },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        customerName: true,
        customerEmail: true,
        customerPhone: true,
      },
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, sku: true, price: true, stock: true },
    }),
  ]);

  const latestByEmail = new Map<
    string,
    { name: string; email: string; phone: string }
  >();

  for (const order of recentOrders) {
    const email = order.customerEmail.trim().toLowerCase();
    if (!email || latestByEmail.has(email)) continue;
    latestByEmail.set(email, {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
    });
  }

  const seen = new Set<string>();
  const customers: IAdminCustomerOption[] = [];

  for (const user of users) {
    const email = user.email.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    customers.push({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: latestByEmail.get(email)?.phone ?? "",
    });
  }

  for (const [email, customer] of latestByEmail) {
    if (seen.has(email)) continue;
    seen.add(email);
    customers.push({
      id: `email:${email}`,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
  }

  customers.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return {
    customers,
    products: products.map((product) => {
      const price = Number(product.price);
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price,
        formattedPrice: currency.format(price),
        stock: product.stock,
      };
    }),
  };
}

/**
 * Cria o pedido a partir do painel. Quem não é admin é recusado antes de
 * qualquer gravação. O frete é cotado de novo, como no checkout do cliente.
 */
export async function submitAdminOrder(
  role: string | null | undefined,
  formData: FormData,
): Promise<IAdminOrderSubmitResult> {
  if (role !== "admin") {
    return failure("Acesso negado.");
  }

  const parsed = readAdminOrderForm(formData);
  if (!parsed.input) {
    return failure(
      parsed.fieldErrors.items ??
        parsed.fieldErrors.payment ??
        "Revise os campos destacados.",
      parsed.fieldErrors,
    );
  }

  const { items, customer, address, source, serviceId, payment } = parsed.input;
  const postalCheck = await checkAddressPostalCode(address);

  if (postalCheck.status === "not-found" || postalCheck.status === "mismatch") {
    return failure(postalCheck.message, postalCheck.fieldErrors);
  }

  const expired = await expireOverdueOrders();
  let stockChanged = expired > 0;
  const summary = await resolveCart(items);

  if (!quantitiesMatch(items, summary.lines)) {
    return failure(
      "Algum produto não está disponível na quantidade pedida.",
      { items: "Revise os produtos e as quantidades." },
      stockChanged,
    );
  }

  const quote = await quoteOrderShipping({
    postalCode: address.postalCode,
    lines: summary.lines,
    serviceId,
  });

  if (quote.status !== "quoted" || quote.price === null) {
    const message =
      quote.message ?? "Não foi possível cotar o frete. Tente novamente.";
    return failure(message, { postalCode: message }, stockChanged);
  }

  try {
    const order = await createOrder({
      items,
      customer,
      address,
      shipping: quote.price,
      shippingService: isLocalPickup(quote.serviceId)
        ? localPickupOption.name
        : null,
      deliveryDays: isLocalPickup(quote.serviceId) ? null : quote.deliveryDays,
      source,
    });
    stockChanged = true;

    if (payment.kind === "link") {
      const checkout = await startCheckout(order.id);
      if (!checkout.ok) {
        return failure(
          `${checkout.message} O pedido foi cancelado e o estoque voltou.`,
          {},
          true,
        );
      }

      return {
        status: "success",
        message: "Link de pagamento gerado.",
        fieldErrors: {},
        orderId: order.id,
        checkoutUrl: checkout.checkoutUrl,
        stockChanged,
      };
    }

    const recorded = await recordExternalPayment(order.id, payment);
    if (recorded !== "paid") {
      await cancelOrder(order.id);
      return failure(
        "Não foi possível registrar o pagamento. O pedido foi cancelado e o estoque voltou.",
        {},
        true,
      );
    }

    return {
      status: "success",
      message: "Pedido marcado como pago.",
      fieldErrors: {},
      orderId: order.id,
      checkoutUrl: null,
      stockChanged,
    };
  } catch (error) {
    if (error instanceof AppError && error.status === 409) {
      return failure(
        error.message
          .replaceAll("no carrinho", "no pedido")
          .replaceAll("do carrinho", "do pedido"),
        {},
        stockChanged,
      );
    }

    throw error;
  }
}
