/**
 * Contrato da página Configurações.
 * O modelo do tempo de produção vale para todos os produtos.
 */

export interface IShopSettings {
  productionTimeTemplate: string;
}

export interface ISettingsFieldErrors {
  productionTimeTemplate?: string;
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
