import { parseCartItems, parsePostalCode } from "@/lib/cart-input";
import type {
  ICheckoutFieldErrors,
  IOrderAddress,
  IOrderCustomer,
} from "@/types/order";
import type { ICartItem } from "@/types/cart";

export interface IParsedCheckoutForm {
  input: {
    items: ICartItem[];
    customer: IOrderCustomer;
    address: IOrderAddress;
  } | null;
  fieldErrors: ICheckoutFieldErrors;
}

export const orderFieldLimits = {
  name: 160,
  email: 254,
  street: 160,
  number: 20,
  complement: 80,
  neighborhood: 120,
  city: 120,
} as const;

/** Siglas das UFs aceitas no endereço de entrega. */
export const brazilianStates = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readRequired(
  formData: FormData,
  key: keyof typeof orderFieldLimits,
  label: string,
  fieldErrors: ICheckoutFieldErrors,
) {
  const value = readString(formData, key);

  if (!value) {
    fieldErrors[key] = `Informe ${label}.`;
  } else if (value.length > orderFieldLimits[key]) {
    fieldErrors[key] = `Use no máximo ${orderFieldLimits[key]} caracteres.`;
  }

  return value;
}

function readItems(formData: FormData) {
  const raw = formData.get("items");
  if (typeof raw !== "string") return null;

  try {
    return parseCartItems(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * Lê e valida o formulário de entrega do carrinho. Só pede o necessário para
 * entregar e contatar a pessoa: nome, e-mail, telefone e endereço.
 */
export function readCheckoutForm(formData: FormData): IParsedCheckoutForm {
  const fieldErrors: ICheckoutFieldErrors = {};

  const name = readRequired(formData, "name", "o nome", fieldErrors);
  if (name && name.length < 2) fieldErrors.name = "Informe o nome completo.";

  const email = readRequired(
    formData,
    "email",
    "o e-mail",
    fieldErrors,
  ).toLowerCase();
  if (
    email &&
    !fieldErrors.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    fieldErrors.email = "Use um e-mail válido, como nome@exemplo.com.";
  }

  const phone = readString(formData, "phone").replace(/\D/g, "");
  if (!/^\d{10,11}$/.test(phone)) {
    fieldErrors.phone = "Informe o telefone com DDD, ex: (11) 91234-5678.";
  }

  const postalCode = parsePostalCode(readString(formData, "postalCode"));
  if (!postalCode) fieldErrors.postalCode = "Informe um CEP com 8 dígitos.";

  const street = readRequired(formData, "street", "a rua", fieldErrors);
  const number = readRequired(formData, "number", "o número", fieldErrors);
  const neighborhood = readRequired(
    formData,
    "neighborhood",
    "o bairro",
    fieldErrors,
  );
  const city = readRequired(formData, "city", "a cidade", fieldErrors);

  const complement = readString(formData, "complement");
  if (complement.length > orderFieldLimits.complement) {
    fieldErrors.complement = `Use no máximo ${orderFieldLimits.complement} caracteres.`;
  }

  const state = readString(formData, "state").toUpperCase();
  if (!brazilianStates.includes(state)) {
    fieldErrors.state = "Selecione o estado.";
  }

  const items = readItems(formData);
  if (!items || items.length === 0) {
    fieldErrors.items = "Seu carrinho está vazio.";
  }

  if (Object.keys(fieldErrors).length > 0 || !postalCode || !items) {
    return { input: null, fieldErrors };
  }

  return {
    input: {
      items,
      customer: { name, email, phone },
      address: {
        postalCode,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
      },
    },
    fieldErrors,
  };
}
