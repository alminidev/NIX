import { parsePostalCode } from "@/lib/cart-input";
import type {
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
