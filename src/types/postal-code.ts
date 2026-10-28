/**
 * Contrato da consulta de CEP. lookupPostalCode() em lib/viacep.ts devolve
 * IPostalCodeLookup; a resposta crua da ViaCEP é IViaCepResponse.
 */

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
