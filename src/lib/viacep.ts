import { parsePostalCode } from "@/lib/cart-input";
import type { IOrderAddress } from "@/types/order";
import type {
  IPostalCodeCheck,
  IPostalCodeLookup,
  TPostalCodeLookupError,
  IViaCepResponse,
} from "@/types/postal-code";
import "server-only";

export const viaCepBaseUrl = "https://viacep.com.br/ws";
export const viaCepTimeoutMs = 5000;

const messages: Record<TPostalCodeLookupError, string> = {
  invalid: "Informe um CEP com 8 dígitos.",
  "not-found": "CEP não encontrado. Confira os números e tente novamente.",
  unavailable:
    "Não foi possível consultar o CEP agora. Tente novamente em instantes.",
};

function failure(reason: TPostalCodeLookupError): IPostalCodeLookup {
  return { status: "error", message: messages[reason], reason, address: null };
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Consulta o endereço de um CEP na ViaCEP. Nunca lança: CEP inválido, CEP
 * inexistente (`erro: true`), falha de rede, timeout e resposta fora do
 * formato viram um resultado com status "error" e a mensagem para a pessoa.
 */
export async function lookupPostalCode(
  rawPostalCode: unknown,
): Promise<IPostalCodeLookup> {
  const postalCode = parsePostalCode(rawPostalCode);
  if (!postalCode) return failure("invalid");

  let data: IViaCepResponse;

  try {
    const response = await fetch(`${viaCepBaseUrl}/${postalCode}/json/`, {
      signal: AbortSignal.timeout(viaCepTimeoutMs),
    });

    if (!response.ok) return failure("unavailable");

    data = (await response.json()) as IViaCepResponse;
  } catch {
    return failure("unavailable");
  }

  if (typeof data !== "object" || data === null) return failure("unavailable");
  if (data.erro === true || data.erro === "true") return failure("not-found");

  const city = text(data.localidade);
  const state = text(data.uf).toUpperCase();
  if (!city || !/^[A-Z]{2}$/.test(state)) return failure("unavailable");

  return {
    status: "success",
    message: "",
    reason: null,
    address: {
      postalCode,
      street: text(data.logradouro),
      neighborhood: text(data.bairro),
      city,
      state,
    },
  };
}

/** Minúsculas, sem acento nem pontuação e com espaços únicos. */
export function normalizePlace(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Confere se cidade e UF do endereço são as do CEP, consultando a ViaCEP.
 * Cidade e UF são comparadas sem acento e sem diferença de maiúsculas.
 * Se a ViaCEP falhar (rede, timeout, resposta inválida) o endereço é aceito
 * como veio (status "skipped"), para que uma queda dela não impeça pedidos.
 */
export async function checkAddressPostalCode(
  address: Pick<IOrderAddress, "postalCode" | "city" | "state">,
): Promise<IPostalCodeCheck> {
  const lookup = await lookupPostalCode(address.postalCode);

  if (lookup.status === "error" || !lookup.address) {
    if (lookup.reason === "unavailable") {
      return { status: "skipped", message: "", fieldErrors: {} };
    }

    return {
      status: "not-found",
      message: lookup.message,
      fieldErrors: { postalCode: lookup.message },
    };
  }

  const expected = lookup.address;
  const cityMatches =
    normalizePlace(address.city) === normalizePlace(expected.city);
  const stateMatches = address.state.trim().toUpperCase() === expected.state;

  if (cityMatches && stateMatches) {
    return { status: "valid", message: "", fieldErrors: {} };
  }

  const fieldErrors: IPostalCodeCheck["fieldErrors"] = {};
  if (!cityMatches) fieldErrors.city = "A cidade não confere com o CEP.";
  if (!stateMatches) fieldErrors.state = "O estado não confere com o CEP.";

  const subject =
    !cityMatches && !stateMatches
      ? "A cidade e o estado informados não conferem"
      : !cityMatches
        ? "A cidade informada não confere"
        : "O estado informado não confere";

  return {
    status: "mismatch",
    message: `${subject} com o CEP, que é de ${expected.city}/${expected.state}.`,
    fieldErrors,
  };
}
