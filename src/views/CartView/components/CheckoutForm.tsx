import { brazilianStates, orderFieldLimits } from "@/lib/order-input";
import type { ICartItem } from "@/types/cart";
import type { ICheckoutFieldErrors } from "@/types/order";
import { useState } from "react";

export const CHECKOUT_FORM_ID = "checkout-form";

type TCheckoutField = Exclude<
  keyof ICheckoutFieldErrors,
  "items" | "postalCode"
>;

interface ICheckoutFormProps {
  items: ICartItem[];
  postalCode: string;
  action: (formData: FormData) => void;
  errors: ICheckoutFieldErrors;
  disabled: boolean;
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
    maxLength: orderFieldLimits.street,
    wide: true,
  },
  {
    name: "number",
    label: "Número",
    autoComplete: "off",
    maxLength: orderFieldLimits.number,
  },
  {
    name: "complement",
    label: "Complemento",
    autoComplete: "address-line2",
    maxLength: orderFieldLimits.complement,
    optional: true,
  },
  {
    name: "neighborhood",
    label: "Bairro",
    autoComplete: "address-level3",
    maxLength: orderFieldLimits.neighborhood,
  },
  {
    name: "city",
    label: "Cidade",
    autoComplete: "address-level2",
    maxLength: orderFieldLimits.city,
  },
];

const fieldClass =
  "min-h-11 w-full min-w-0 rounded-input border bg-white px-3 text-[0.9375rem] text-ink-primary placeholder:text-ink-muted disabled:opacity-60";

function fieldBorder(invalid: boolean) {
  return invalid ? "border-[#9b1c1c]" : "border-border-hairline";
}

/**
 * CheckoutForm — Dados de contato e endereço de entrega do pedido. O CEP vem
 * do campo do resumo; os itens seguem como estão no carrinho e são conferidos
 * de novo no servidor ao criar o pedido.
 */
export default function CheckoutForm({
  items,
  postalCode,
  action,
  errors,
  disabled,
}: ICheckoutFormProps) {
  const [values, setValues] = useState<Record<TCheckoutField, string>>({
    name: "",
    email: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

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
          disabled={disabled}
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
      <input type="hidden" name="postalCode" value={postalCode} />

      <h2 className="mb-5 text-xl font-semibold tracking-[-0.01em] text-ink-primary">
        Dados para entrega
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {personalFields.map(renderField)}
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
            disabled={disabled}
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
