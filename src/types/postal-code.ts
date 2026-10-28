/**
 * Contrato da consulta de CEP. lookupPostalCode() em lib/viacep.ts devolve
 * IPostalCodeLookup; a resposta crua da ViaCEP é IViaCepResponse.
 * checkAddressPostalCode() devolve IPostalCodeCheck.
 */

import type { ICheckoutFieldErrors } from "@/types/order";

/** Resposta de https://viacep.com.br/ws/{cep}/json/ */
export interface IViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  /** Presente (true) quando o CEP tem formato válido mas não existe */
  erro?: boolean | string;
}

export interface IPostalCodeAddress {
  /** CEP, só dígitos (8) */
  postalCode: string;
  /** Vazio em CEP único da cidade */
  street: string;
  /** Vazio em CEP único da cidade */
  neighborhood: string;
  city: string;
  /** Sigla da UF (ex: 'SP') */
  state: string;
}

export type TPostalCodeLookupError = "invalid" | "not-found" | "unavailable";

export interface IPostalCodeLookup {
  status: "error" | "success";
  message: string;
  /** Motivo da falha; null quando a consulta deu certo */
  reason: TPostalCodeLookupError | null;
  address: IPostalCodeAddress | null;
}

/**
 * Resultado de conferir cidade e UF de um endereço com o CEP.
 * - valid: a ViaCEP confirmou o endereço.
 * - skipped: a ViaCEP não respondeu; o endereço é aceito como veio.
 * - not-found: o CEP não existe.
 * - mismatch: cidade e/ou UF não são as do CEP.
 */
export type TPostalCodeCheckStatus =
  "valid" | "skipped" | "not-found" | "mismatch";

export interface IPostalCodeCheck {
  status: TPostalCodeCheckStatus;
  /** Vazio quando o endereço é aceito */
  message: string;
  /** Campos do formulário de entrega a destacar */
  fieldErrors: Pick<ICheckoutFieldErrors, "postalCode" | "city" | "state">;
}
