import type {
  IShippingProviderSetup,
  TShippingProvider,
} from "@/lib/shipping-provider";

/**
 * Contrato da página Configurações.
 * O modelo do tempo de produção vale para todos os produtos.
 * O provedor de frete escolhe quem cota a entrega.
 */

export interface IShopSettings {
  productionTimeTemplate: string;
  shippingProvider: TShippingProvider;
  shippingSettingsReady: boolean;
  shippingSetup: Record<TShippingProvider, IShippingProviderSetup>;
}

export interface ISettingsFieldErrors {
  productionTimeTemplate?: string;
  shippingProvider?: string;
}

export interface ISettingsFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors: ISettingsFieldErrors;
}

export const settingsFormInitialState: ISettingsFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export type TSettingsNotice = "saved";
