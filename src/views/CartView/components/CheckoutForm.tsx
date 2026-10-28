import { lookupAddress, quoteShipping } from "@/app/cart/actions";
import { maskPostalCode } from "@/lib/cart-input";
import { brazilianStates, orderFieldLimits } from "@/lib/order-input";
import type { ICartItem, IShippingQuote } from "@/types/cart";
import type { ICheckoutFieldErrors } from "@/types/order";
import { useState } from "react";

export const CHECKOUT_FORM_ID = "checkout-form";

type TCheckoutField = Exclude<keyof ICheckoutFieldErrors, "items">;

interface ICheckoutFormProps {
  items: ICartItem[];
  action: (formData: FormData) => void;
  errors: ICheckoutFieldErrors;
  disabled: boolean;
  onShippingChange: (quote: IShippingQuote | null) => void;
  /** Avisa quando o endereço foi preenchido (ou perdido) pela consulta do CEP */
  onAddressReadyChange: (ready: boolean) => void;
}

interface ITextField {
  name: TCheckoutField;
  label: string;
  autoComplete: string;
  inputMode?: "tel" | "email";
  type?: "email" | "tel";
  maxLength: number;
  optional?: boolean;
  wide?: boolean;
  /** Fica desabilitado até o CEP ser consultado com sucesso */
  locked?: boolean;
}

const personalFields: ITextField[] = [
  {
    name: "name",
    label: "Nome completo",
    autoComplete: "name",
    maxLength: orderFieldLimits.name,
    wide: true,
  },
  {
    name: "email",
    label: "E-mail",
    autoComplete: "email",
    type: "email",
    inputMode: "email",
    maxLength: orderFieldLimits.email,
  },
  {
    name: "phone",
    label: "Telefone com DDD",
    autoComplete: "tel",
    type: "tel",
    inputMode: "tel",
    maxLength: 20,
  },
];

const addressFields: ITextField[] = [
  {
    name: "street",
    label: "Rua",
    autoComplete: "address-line1",
    locked: true,
    maxLength: orderFieldLimits.street,
    wide: true,
  },
  {
    name: "number",
    label: "Número",
    autoComplete: "off",
    locked: true,
    maxLength: orderFieldLimits.number,
  },
  {
    name: "complement",
    label: "Complemento",
    autoComplete: "address-line2",
    locked: true,
    maxLength: orderFieldLimits.complement,
    optional: true,
  },
  {
    name: "neighborhood",
    label: "Bairro",
    autoComplete: "address-level3",
    locked: true,
    maxLength: orderFieldLimits.neighborhood,
  },
  {
    name: "city",
    label: "Cidade",
    autoComplete: "address-level2",
    locked: true,
    maxLength: orderFieldLimits.city,
  },
];

const fieldClass =
  "min-h-11 w-full min-w-0 rounded-input border bg-white px-3 text-[0.9375rem] text-ink-primary placeholder:text-ink-muted disabled:opacity-60";

function fieldBorder(invalid: boolean) {
  return invalid ? "border-[#9b1c1c]" : "border-border-hairline";
}

/**
 * CheckoutForm — Dados de contato e endereço de entrega do pedido. O endereço
 * só é liberado depois que o CEP é consultado (botão Calcular), que também
 * cota o frete. Os itens seguem como estão no carrinho e são conferidos de
 * novo no servidor ao criar o pedido.
 */
export default function CheckoutForm({
  items,
  action,
  errors,
  disabled,
  onShippingChange,
  onAddressReadyChange,
}: ICheckoutFormProps) {
  const [values, setValues] = useState<Record<TCheckoutField, string>>({
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

  const [addressFound, setAddressFound] = useState(false);
  const [looking, setLooking] = useState(false);
  const [postalMessage, setPostalMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);

  function changePostalCode(value: string) {
    setValues((current) => ({ ...current, postalCode: maskPostalCode(value) }));
    setPostalMessage(null);

    // Outro CEP: o endereço anterior não vale mais e o frete precisa de nova cotação.
    if (addressFound) {
      setAddressFound(false);
      onAddressReadyChange(false);
      onShippingChange(null);
      setValues((current) => ({
        ...current,
        street: "",
        neighborhood: "",
        city: "",
        state: "",
      }));
    }
  }

  async function handleLookup() {
    setLooking(true);
    setPostalMessage(null);

    try {
      const [lookup, shipping] = await Promise.all([
        lookupAddress(values.postalCode),
        quoteShipping(values.postalCode, items),
      ]);

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
      onAddressReadyChange(true);
      onShippingChange(shipping.quote);
      setPostalMessage({
        error: shipping.status === "error",
        text:
          shipping.message ||
          (shipping.quote?.deliveryDays
            ? `Entrega em até ${shipping.quote.deliveryDays} dias úteis.`
            : ""),
      });
    } catch {
      setPostalMessage({
        error: true,
        text: "Não foi possível consultar o CEP. Tente novamente.",
      });
    } finally {
      setLooking(false);
    }
  }

  function renderField(field: ITextField) {
    const error = errors[field.name];

    return (
      <div key={field.name} className={field.wide ? "sm:col-span-2" : ""}>
        <label
          htmlFor={`checkout-${field.name}`}
          className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary"
        >
          {field.label}
          {field.optional ? (
            <span className="font-normal text-ink-muted"> (opcional)</span>
          ) : null}
        </label>
        <input
          id={`checkout-${field.name}`}
          name={field.name}
          type={field.type ?? "text"}
          value={values[field.name]}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              [field.name]: event.target.value,
            }))
          }
          autoComplete={field.autoComplete}
          inputMode={field.inputMode}
          maxLength={field.maxLength}
          disabled={disabled || (field.locked && !addressFound)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `checkout-${field.name}-error` : undefined}
          className={`${fieldClass} ${fieldBorder(Boolean(error))}`}
        />
        {error ? (
          <p
            id={`checkout-${field.name}-error`}
            className="mt-1.5 text-xs text-[#9b1c1c]"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      id={CHECKOUT_FORM_ID}
      action={action}
      noValidate
      className="mt-8 rounded-card border border-border-hairline bg-surface-card p-6"
    >
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <h2 className="mb-5 text-xl font-semibold tracking-[-0.01em] text-ink-primary">
        Dados para entrega
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {personalFields.map(renderField)}

        <div className="sm:col-span-2">
          <label
            htmlFor="checkout-postalCode"
            className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary"
          >
            CEP
          </label>
          <div className="flex gap-2">
            <input
              id="checkout-postalCode"
              name="postalCode"
              value={values.postalCode}
              onChange={(event) => changePostalCode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                if (!looking) void handleLookup();
              }}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              maxLength={9}
              disabled={disabled}
              aria-invalid={
                Boolean(errors.postalCode) || (postalMessage?.error ?? false)
              }
              aria-describedby="checkout-postalCode-message"
              className={`${fieldClass} ${fieldBorder(Boolean(errors.postalCode) || (postalMessage?.error ?? false))}`}
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={disabled || looking}
              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-pill border border-[rgba(23,107,255,0.2)] bg-brand-blue-subtle px-4 text-sm font-semibold text-brand-blue-hover transition-colors hover:bg-brand-blue hover:text-ink-inverse disabled:cursor-not-allowed disabled:opacity-60"
            >
              {looking ? "Calculando…" : "Calcular"}
            </button>
          </div>
          <p
            id="checkout-postalCode-message"
            role="status"
            className={`mt-1.5 text-xs empty:hidden ${postalMessage?.error || errors.postalCode ? "text-[#9b1c1c]" : "text-ink-secondary"}`}
          >
            {errors.postalCode ?? postalMessage?.text}
          </p>
        </div>

        {addressFields.map(renderField)}

        <div>
          <label
            htmlFor="checkout-state"
            className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary"
          >
            Estado
          </label>
          <select
            id="checkout-state"
            name="state"
            value={values.state}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                state: event.target.value,
              }))
            }
            autoComplete="address-level1"
            disabled={disabled || !addressFound}
            aria-invalid={Boolean(errors.state)}
            aria-describedby={errors.state ? "checkout-state-error" : undefined}
            className={`${fieldClass} ${fieldBorder(Boolean(errors.state))}`}
          >
            <option value="">Selecione</option>
            {brazilianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state ? (
            <p
              id="checkout-state-error"
              className="mt-1.5 text-xs text-[#9b1c1c]"
            >
              {errors.state}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
