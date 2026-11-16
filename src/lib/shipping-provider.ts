/**
 * Provedor de frete ativo da loja. Sem registro, vale o Melhor Envio.
 * Tokens não ficam aqui: só o identificador gravado em shop_settings.
 */

export const shippingProviders = ["melhor_envio", "central_do_frete"] as const;

export type TShippingProvider = (typeof shippingProviders)[number];

export const defaultShippingProvider: TShippingProvider = "melhor_envio";

export interface IShippingProviderOption {
  id: TShippingProvider;
  label: string;
  description: string;
}

export const shippingProviderOptions: IShippingProviderOption[] = [
  {
    id: "melhor_envio",
    label: "Melhor Envio",
    description: "Cotação usada hoje. A entrega continua sendo feita por fora.",
  },
  {
    id: "central_do_frete",
    label: "Central do Frete",
    description:
      "Cota no lugar do Melhor Envio. A loja não contrata o frete nem gera etiqueta.",
  },
];

export interface IShippingProviderSetup {
  ready: boolean;
  /** Nomes das variáveis ausentes ou inválidas. Nunca os valores. */
  missing: string[];
}

export function parseShippingProvider(value: unknown): TShippingProvider | null {
  if (value === "melhor_envio" || value === "central_do_frete") return value;
  return null;
}
