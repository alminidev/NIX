/** Pessoa física (CPF) ou empresa (CNPJ). Os valores coincidem com o enum do pedido. */
export const customerKinds = ["PERSON", "COMPANY"] as const;

export type TCustomerKind = (typeof customerKinds)[number];

const cpfWeights = [10, 9, 8, 7, 6, 5, 4, 3, 2];
const cpfWeights2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const cnpjWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const cnpjWeights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function checkDigit(values: number[], weights: number[]) {
  const sum = values.reduce(
    (total, value, index) => total + value * weights[index],
    0,
  );
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/** Valor do caractere no CNPJ alfanumérico: código ASCII menos 48. Dígito continua valendo o próprio número. */
function characterValue(character: string) {
  return character.charCodeAt(0) - 48;
}

/** CPF só com dígitos, no máximo 11, no formato 000.000.000-00. */
export function maskCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const part = (start: number, end: number) => digits.slice(start, end);

  if (digits.length <= 3) return part(0, 3);
  if (digits.length <= 6) return `${part(0, 3)}.${part(3, 6)}`;
  if (digits.length <= 9) return `${part(0, 3)}.${part(3, 6)}.${part(6, 9)}`;
  return `${part(0, 3)}.${part(3, 6)}.${part(6, 9)}-${part(9, 11)}`;
}

/**
 * CNPJ no formato 00.000.000/0000-00. As 12 primeiras posições aceitam
 * letra (CNPJ alfanumérico); os dois dígitos verificadores continuam numéricos.
 */
export function maskCnpj(value: string) {
  const raw = value.toUpperCase().replace(/[^0-9A-Z]/g, "");
  let body = "";
  let check = "";

  for (const character of raw) {
    if (body.length < 12) {
      body += character;
      continue;
    }
    if (check.length < 2 && /\d/.test(character)) check += character;
  }

  let formatted = body.slice(0, 2);
  if (body.length > 2) formatted += `.${body.slice(2, 5)}`;
  if (body.length > 5) formatted += `.${body.slice(5, 8)}`;
  if (body.length > 8) formatted += `/${body.slice(8, 12)}`;
  if (check.length > 0) formatted += `-${check}`;
  return formatted;
}

export function maskDocument(kind: TCustomerKind, value: string) {
  return kind === "PERSON" ? maskCpf(value) : maskCnpj(value);
}

export function isValidCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!/^\d{11}$/.test(digits)) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const numbers = [...digits].map(Number);
  return (
    checkDigit(numbers.slice(0, 9), cpfWeights) === numbers[9] &&
    checkDigit(numbers.slice(0, 10), cpfWeights2) === numbers[10]
  );
}

export function isValidCnpj(value: string) {
  const compact = value.toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (!/^[0-9A-Z]{12}\d{2}$/.test(compact)) return false;
  if (/^(.)\1{13}$/.test(compact)) return false;

  const numbers = [...compact].map(characterValue);
  return (
    checkDigit(numbers.slice(0, 12), cnpjWeights) === numbers[12] &&
    checkDigit(numbers.slice(0, 13), cnpjWeights2) === numbers[13]
  );
}

/** Documento normalizado para gravar, ou null quando o valor não é válido. */
export function parseDocument(kind: TCustomerKind, value: string) {
  if (kind === "PERSON") {
    const digits = value.replace(/\D/g, "");
    return isValidCpf(digits) ? digits : null;
  }

  const compact = value.toUpperCase().replace(/[^0-9A-Z]/g, "");
  return isValidCnpj(compact) ? compact : null;
}

export function formatDocument(kind: TCustomerKind, document: string) {
  return maskDocument(kind, document);
}

export function isCustomerKind(value: string): value is TCustomerKind {
  return customerKinds.some((kind) => kind === value);
}
