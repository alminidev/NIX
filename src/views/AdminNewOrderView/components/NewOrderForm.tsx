"use client";

import { createAdminOrder } from "@/app/admin/orders/actions";
import { lookupAddress, quoteShipping } from "@/app/cart/actions";
import {
  externalPaymentMethodLabels,
  externalPaymentMethods,
  todayInBrazil,
} from "@/lib/admin-order-form";
import {
  calculateTotal,
  formatCurrency,
  maxCartQuantity,
} from "@/lib/cart-calculation";
import { maskPostalCode } from "@/lib/cart-input";
import { isInfinitePayCheckoutUrl } from "@/lib/checkout-url";
import { brazilianStates, orderFieldLimits } from "@/lib/order-input";
import {
  formatDeliveryDays,
  formatShippingAmount,
  isLocalPickup,
  shippingChoiceLabel,
} from "@/lib/shipping-display";
import {
  adminOrderFormInitialState,
  type IAdminCustomerOption,
  type IAdminOrderFieldErrors,
  type IAdminOrderProductOption,
} from "@/types/admin-order";
import type { ICartItem, IShippingQuote } from "@/types/cart";
import { orderSourceLabels } from "@/views/AdminOrdersView/components/order-display";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

interface INewOrderFormProps {
  customers: IAdminCustomerOption[];
  products: IAdminOrderProductOption[];
}

interface IProductLine {
  key: string;
  productId: string;
  quantity: string;
}

type TField = Exclude<keyof IAdminOrderFieldErrors, "items" | "source" | "payment" | "paymentMethod" | "paidAt">;

const fieldClass =
  "min-h-11 w-full min-w-0 rounded-input border bg-white px-3 text-[0.9375rem] text-ink-primary placeholder:text-ink-muted disabled:opacity-60";

const sources = ["WHATSAPP", "INSTAGRAM", "SITE"] as const;

function fieldBorder(invalid: boolean) {
  return invalid ? "border-[#9b1c1c]" : "border-border-hairline";
}

function toCartItems(
  lines: IProductLine[],
  products: IAdminOrderProductOption[],
): ICartItem[] {
  const items: ICartItem[] = [];

  for (const line of lines) {
    const product = products.find((item) => String(item.id) === line.productId);
    const quantity = Number(line.quantity);
    if (!product || product.stock < 1) continue;
    if (!Number.isInteger(quantity) || quantity < 1) continue;
    if (items.some((item) => item.productId === product.id)) continue;

    items.push({
      productId: product.id,
      quantity: Math.min(quantity, product.stock, maxCartQuantity),
    });
  }

  return items;
}

export default function NewOrderForm({ customers, products }: INewOrderFormProps) {
  const [state, action, pending] = useActionState(
    createAdminOrder,
    adminOrderFormInitialState,
  );
  const [, startTransition] = useTransition();
  const [customerId, setCustomerId] = useState("");
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    postalCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const [source, setSource] = useState("");
  const [lines, setLines] = useState<IProductLine[]>([
    { key: "line-1", productId: "", quantity: "1" },
  ]);
  const lineCounter = useRef(1);
  const [addressFound, setAddressFound] = useState(false);
  const [looking, setLooking] = useState(false);
  const [postalMessage, setPostalMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);
  const [shipping, setShipping] = useState<IShippingQuote | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [paymentChoice, setPaymentChoice] = useState<"link" | "external">("link");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");
  const [paidOn, setPaidOn] = useState(todayInBrazil);
  const lookupId = useRef(0);
  const reportedState = useRef(state);
  const errors = state.fieldErrors;
  const items = toCartItems(lines, products);
  const itemsKey = JSON.stringify(items);

  useEffect(() => {
    if (reportedState.current === state) return;
    reportedState.current = state;
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  useEffect(() => {
    lookupId.current += 1;
    setShipping(null);
    setServiceId(null);
    setPostalMessage(null);
    setLooking(false);
  }, [itemsKey]);

  function setField(name: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function chooseCustomer(id: string) {
    setCustomerId(id);
    const customer = customers.find((item) => item.id === id);
    if (!customer) return;
    setValues((current) => ({
      ...current,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    }));
  }

  function changePostalCode(value: string) {
    setField("postalCode", maskPostalCode(value));
    setPostalMessage(null);
    if (!addressFound) return;

    setAddressFound(false);
    setShipping(null);
    setServiceId(null);
    setValues((current) => ({
      ...current,
      postalCode: maskPostalCode(value),
      street: "",
      neighborhood: "",
      city: "",
      state: "",
    }));
  }

  async function handleLookup() {
    const id = ++lookupId.current;
    setLooking(true);
    setPostalMessage(null);

    try {
      const [lookup, quoted] = await Promise.all([
        lookupAddress(values.postalCode),
        quoteShipping(values.postalCode, items),
      ]);

      if (id !== lookupId.current) return;

      if (lookup.status === "error" || !lookup.address) {
        setPostalMessage({ error: true, text: lookup.message });
        return;
      }

      const { address } = lookup;
      setValues((current) => ({
        ...current,
        street: address.street,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
      }));
      setAddressFound(true);
      setShipping(quoted.quote);
      const first =
        quoted.quote?.status === "quoted" ? quoted.quote.options[0] : undefined;
      setServiceId(first ? first.serviceId : null);
      setPostalMessage(
        quoted.status === "error"
          ? {
              error: true,
              text:
                quoted.message ||
                "Não foi possível cotar o frete agora. Tente novamente em instantes.",
            }
          : null,
      );
    } catch {
      if (id !== lookupId.current) return;
      setPostalMessage({
        error: true,
        text: "Não foi possível consultar o CEP. Tente novamente.",
      });
    } finally {
      if (id === lookupId.current) setLooking(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  }

  if (state.status === "success" && state.orderId) {
    const checkoutUrl =
      state.checkoutUrl && isInfinitePayCheckoutUrl(state.checkoutUrl)
        ? state.checkoutUrl
        : null;

    return (
      <div className="flex w-full flex-1 flex-col gap-6">
        <header>
          <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
            Pedido nº {state.orderId} criado
          </h1>
          <p className="mt-2 max-w-140 text-[0.9375rem] text-ink-secondary">
            {state.message}
          </p>
        </header>
        {checkoutUrl ? (
          <div className="rounded-card border border-border-hairline bg-surface-card p-5">
            <p className="text-sm font-semibold text-ink-primary">
              Link da InfinitePay
            </p>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-11 items-center break-all text-brand-blue-hover transition-colors hover:text-brand-blue"
            >
              {checkoutUrl}
            </a>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/admin/orders/${state.orderId}`}
            className="inline-flex min-h-11 items-center justify-center rounded-pill bg-brand-blue px-5 text-sm font-semibold text-ink-inverse transition-[background-color] duration-200 ease-nix hover:bg-brand-blue-hover"
          >
            Ver pedido
          </Link>
          <Link
            href="/admin/orders/new"
            className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-hairline bg-surface-card px-5 text-sm font-semibold text-ink-primary"
          >
            Criar outro
          </Link>
        </div>
      </div>
    );
  }

  const selectedOption =
    shipping?.status === "quoted"
      ? (shipping.options.find((option) => option.serviceId === serviceId) ??
        shipping.options[0])
      : undefined;
  const subtotal = items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const shippingPrice =
    selectedOption && shipping?.status === "quoted" ? selectedOption.price : null;
  const total = shippingPrice === null ? null : calculateTotal(subtotal, shippingPrice);
  const statusText =
    errors.postalCode ??
    (postalMessage?.error
      ? postalMessage.text
      : isLocalPickup(selectedOption?.serviceId)
        ? shipping?.message || "Retirada no local, sem custo de frete."
        : selectedOption
          ? `Entrega em até ${formatDeliveryDays(selectedOption.deliveryDays)}.`
          : postalMessage?.text);
  const statusIsError = Boolean(errors.postalCode) || (postalMessage?.error ?? false);

  function renderText(
    name: TField,
    label: string,
    options: {
      type?: "email" | "tel";
      inputMode?: "email" | "tel" | "numeric";
      autoComplete: string;
      maxLength: number;
      locked?: boolean;
      optional?: boolean;
      wide?: boolean;
    },
  ) {
    const error = errors[name];
    const value = values[name as keyof typeof values] ?? "";

    return (
      <div className={options.wide ? "sm:col-span-2" : ""}>
        <label
          htmlFor={`order-${name}`}
          className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary"
        >
          {label}
          {options.optional ? (
            <span className="font-normal text-ink-muted"> (opcional)</span>
          ) : null}
        </label>
        <input
          id={`order-${name}`}
          name={name}
          type={options.type ?? "text"}
          value={value}
          onChange={(event) => setField(name as keyof typeof values, event.target.value)}
          autoComplete={options.autoComplete}
          inputMode={options.inputMode}
          maxLength={options.maxLength}
          disabled={options.locked && !addressFound}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `order-${name}-error` : undefined}
          className={`${fieldClass} ${fieldBorder(Boolean(error))}`}
        />
        {error ? (
          <p id={`order-${name}-error`} className="mt-1.5 text-xs text-[#9b1c1c]">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full flex-1 flex-col gap-6">
      <header>
        <Link
          href="/admin/orders"
          className="mb-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-ink-secondary transition-colors hover:text-brand-blue"
        >
          <ArrowLeft size={16} aria-hidden />
          Pedidos
        </Link>
        <p className="mb-2 text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
          Vendas
        </p>
        <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
          Novo pedido
        </h1>
        <p className="mt-2 max-w-140 text-[0.9375rem] text-ink-secondary">
          O endereço é obrigatório. O frete é cotado como no checkout do cliente.
        </p>
      </header>

      <section className="rounded-card border border-border-hairline bg-surface-card p-5 min-[640px]:p-6">
        <h2 className="text-lg font-semibold text-ink-primary">Cliente</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="order-customer"
              className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary"
            >
              Cliente já cadastrado
            </label>
            <select
              id="order-customer"
              value={customerId}
              onChange={(event) => chooseCustomer(event.target.value)}
              className={fieldClass}
            >
              <option value="">Novo cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} · {customer.email}
                </option>
              ))}
            </select>
          </div>
          {renderText("name", "Nome completo", {
            autoComplete: "name",
            maxLength: orderFieldLimits.name,
            wide: true,
          })}
          {renderText("email", "E-mail", {
            type: "email",
            inputMode: "email",
            autoComplete: "email",
            maxLength: orderFieldLimits.email,
          })}
          {renderText("phone", "Telefone com DDD", {
            type: "tel",
            inputMode: "tel",
            autoComplete: "tel",
            maxLength: 20,
          })}
          <div className="sm:col-span-2">
            <label
              htmlFor="order-source"
              className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary"
            >
              Origem
            </label>
            <select
              id="order-source"
              name="source"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              aria-invalid={Boolean(errors.source)}
              className={`${fieldClass} ${fieldBorder(Boolean(errors.source))}`}
            >
              <option value="">Selecione</option>
              {sources.map((item) => (
                <option key={item} value={item}>
                  {orderSourceLabels[item]}
                </option>
              ))}
            </select>
            {errors.source ? (
              <p className="mt-1.5 text-xs text-[#9b1c1c]">{errors.source}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-card border border-border-hairline bg-surface-card p-5 min-[640px]:p-6">
        <h2 className="text-lg font-semibold text-ink-primary">Produtos</h2>
        {errors.items ? (
          <p className="mt-2 text-xs text-[#9b1c1c]" role="alert">
            {errors.items}
          </p>
        ) : null}
        <div className="mt-4 flex flex-col gap-3">
          {lines.map((line, index) => {
            const taken = new Set(
              lines
                .filter((item) => item.key !== line.key && item.productId)
                .map((item) => item.productId),
            );
            const product = products.find((item) => String(item.id) === line.productId);
            const max = product
              ? Math.min(product.stock, maxCartQuantity)
              : maxCartQuantity;

            return (
              <div
                key={line.key}
                className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7.5rem_auto]"
              >
                <label className="sr-only" htmlFor={`order-product-${line.key}`}>
                  Produto {index + 1}
                </label>
                <select
                  id={`order-product-${line.key}`}
                  value={line.productId}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item) =>
                        item.key === line.key
                          ? { ...item, productId: event.target.value, quantity: "1" }
                          : item,
                      ),
                    )
                  }
                  className={fieldClass}
                >
                  <option value="">Selecione o produto</option>
                  {products.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      disabled={item.stock < 1 || taken.has(String(item.id))}
                    >
                      {item.name} · {item.formattedPrice}
                      {item.stock < 1
                        ? " · sem estoque"
                        : ` · ${item.stock} em estoque`}
                    </option>
                  ))}
                </select>
                <label className="sr-only" htmlFor={`order-qty-${line.key}`}>
                  Quantidade do produto {index + 1}
                </label>
                <input
                  id={`order-qty-${line.key}`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={max}
                  value={line.quantity}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item) =>
                        item.key === line.key
                          ? { ...item, quantity: event.target.value }
                          : item,
                      ),
                    )
                  }
                  aria-label={`Quantidade do produto ${index + 1}`}
                  className={fieldClass}
                />
                {lines.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setLines((current) =>
                        current.filter((item) => item.key !== line.key),
                      )
                    }
                    className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-hairline px-3 text-ink-secondary"
                    aria-label={`Remover produto ${index + 1}`}
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                ) : (
                  <span className="hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => {
            lineCounter.current += 1;
            setLines((current) => [
              ...current,
              { key: `line-${lineCounter.current}`, productId: "", quantity: "1" },
            ]);
          }}
          className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-blue-hover"
        >
          <Plus size={16} aria-hidden />
          Adicionar produto
        </button>
        <input type="hidden" name="items" value={JSON.stringify(items)} />
      </section>

      <section className="rounded-card border border-border-hairline bg-surface-card p-5 min-[640px]:p-6">
        <h2 className="text-lg font-semibold text-ink-primary">Entrega</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="order-postalCode"
              className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary"
            >
              CEP
            </label>
            <div className="flex gap-2">
              <input
                id="order-postalCode"
                name="postalCode"
                value={values.postalCode}
                onChange={(event) => changePostalCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  if (!looking && items.length > 0) void handleLookup();
                }}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                maxLength={9}
                aria-invalid={statusIsError}
                aria-describedby="order-postalCode-message"
                className={`${fieldClass} ${fieldBorder(statusIsError)}`}
              />
              <button
                type="button"
                onClick={() => void handleLookup()}
                disabled={looking || items.length === 0}
                className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-pill border border-[rgba(23,107,255,0.2)] bg-brand-blue-subtle px-4 text-sm font-semibold text-brand-blue-hover transition-colors hover:bg-brand-blue hover:text-ink-inverse disabled:cursor-not-allowed disabled:opacity-60"
              >
                {looking ? "Calculando…" : "Calcular"}
              </button>
            </div>
            <p
              id="order-postalCode-message"
              role="status"
              className={`mt-1.5 text-xs empty:hidden ${statusIsError ? "text-[#9b1c1c]" : "text-ink-secondary"}`}
            >
              {items.length === 0
                ? "Escolha um produto antes de calcular o frete."
                : statusText}
            </p>
            {shipping?.status === "quoted" && shipping.options.length > 0 ? (
              <fieldset className="mt-3">
                <legend className="mb-2 text-[0.8125rem] font-semibold text-ink-secondary">
                  Opções de frete
                </legend>
                <div className="flex flex-col gap-2">
                  {shipping.options.map((option) => {
                    const id = `order-shipping-${option.serviceId}`;
                    const checked = option.serviceId === selectedOption?.serviceId;
                    return (
                      <label
                        key={option.serviceId}
                        htmlFor={id}
                        className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-input border px-3 py-2 ${checked ? "border-brand-blue bg-brand-blue-subtle" : "border-border-hairline bg-white"}`}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <input
                            id={id}
                            type="radio"
                            name="shippingServiceId"
                            value={option.serviceId}
                            checked={checked}
                            onChange={() => setServiceId(option.serviceId)}
                            className="size-4 shrink-0 accent-brand-blue"
                          />
                          <span className="min-w-0 text-sm font-semibold text-ink-primary">
                            {shippingChoiceLabel(option)}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-ink-primary tabular-nums">
                          {formatShippingAmount(option.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}
          </div>
          {renderText("street", "Rua", {
            autoComplete: "address-line1",
            locked: true,
            maxLength: orderFieldLimits.street,
            wide: true,
          })}
          {renderText("number", "Número", {
            autoComplete: "off",
            locked: true,
            maxLength: orderFieldLimits.number,
          })}
          {renderText("complement", "Complemento", {
            autoComplete: "address-line2",
            locked: true,
            maxLength: orderFieldLimits.complement,
            optional: true,
          })}
          {renderText("neighborhood", "Bairro", {
            autoComplete: "address-level3",
            locked: true,
            maxLength: orderFieldLimits.neighborhood,
          })}
          {renderText("city", "Cidade", {
            autoComplete: "address-level2",
            locked: true,
            maxLength: orderFieldLimits.city,
          })}
          <div>
            <label
              htmlFor="order-state"
              className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary"
            >
              Estado
            </label>
            <select
              id="order-state"
              name="state"
              value={values.state}
              onChange={(event) => setField("state", event.target.value)}
              autoComplete="address-level1"
              disabled={!addressFound}
              aria-invalid={Boolean(errors.state)}
              className={`${fieldClass} ${fieldBorder(Boolean(errors.state))}`}
            >
              <option value="">Selecione</option>
              {brazilianStates.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.state ? (
              <p className="mt-1.5 text-xs text-[#9b1c1c]">{errors.state}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-card border border-border-hairline bg-surface-card p-5 min-[640px]:p-6">
        <h2 className="text-lg font-semibold text-ink-primary">Pagamento</h2>
        <fieldset className="mt-4 flex flex-col gap-2">
          <legend className="sr-only">Como registrar o pagamento</legend>
          <label className="flex min-h-11 items-center gap-2.5 text-sm font-semibold text-ink-primary">
            <input
              type="radio"
              name="paymentChoice"
              value="link"
              checked={paymentChoice === "link"}
              onChange={() => setPaymentChoice("link")}
              className="size-4 accent-brand-blue"
            />
            Gerar link da InfinitePay
          </label>
          <label className="flex min-h-11 items-center gap-2.5 text-sm font-semibold text-ink-primary">
            <input
              type="radio"
              name="paymentChoice"
              value="external"
              checked={paymentChoice === "external"}
              onChange={() => setPaymentChoice("external")}
              className="size-4 accent-brand-blue"
            />
            Pago por fora
          </label>
        </fieldset>
        {errors.payment ? (
          <p className="mt-2 text-xs text-[#9b1c1c]">{errors.payment}</p>
        ) : null}
        {paymentChoice === "external" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="order-payment-method"
                className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary"
              >
                Forma
              </label>
              <select
                id="order-payment-method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value === "credit_card" ? "credit_card" : "pix")
                }
                aria-invalid={Boolean(errors.paymentMethod)}
                className={`${fieldClass} ${fieldBorder(Boolean(errors.paymentMethod))}`}
              >
                {externalPaymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {externalPaymentMethodLabels[method]}
                  </option>
                ))}
              </select>
              {errors.paymentMethod ? (
                <p className="mt-1.5 text-xs text-[#9b1c1c]">{errors.paymentMethod}</p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="order-paid-on"
                className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary"
              >
                Data do pagamento
              </label>
              <input
                id="order-paid-on"
                name="paidOn"
                type="date"
                value={paidOn}
                max={todayInBrazil()}
                onChange={(event) => setPaidOn(event.target.value)}
                aria-invalid={Boolean(errors.paidAt)}
                className={`${fieldClass} ${fieldBorder(Boolean(errors.paidAt))}`}
              />
              {errors.paidAt ? (
                <p className="mt-1.5 text-xs text-[#9b1c1c]">{errors.paidAt}</p>
              ) : null}
            </div>
          </div>
        ) : null}
        <dl className="mt-5 flex flex-col gap-2 border-t border-border-hairline pt-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-secondary">Produtos</dt>
            <dd className="font-semibold text-ink-primary tabular-nums">
              {formatCurrency(subtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-secondary">Frete</dt>
            <dd className="font-semibold text-ink-primary tabular-nums">
              {shippingPrice === null ? "—" : formatShippingAmount(shippingPrice)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="font-semibold text-ink-primary">Total</dt>
            <dd className="text-lg font-bold text-ink-primary tabular-nums">
              {total === null ? "—" : formatCurrency(total)}
            </dd>
          </div>
        </dl>
      </section>

      <button
        type="submit"
        disabled={pending || looking}
        className="inline-flex min-h-12 items-center justify-center rounded-pill bg-brand-blue px-6 text-sm font-semibold text-ink-inverse transition-[background-color] duration-200 ease-nix hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Criando…" : "Criar pedido"}
      </button>
    </form>
  );
}
