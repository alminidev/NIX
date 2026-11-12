/**
 * Contrato do gerenciamento de categorias no painel.
 * getAdminCategoryList() em lib/admin-categories.ts devolve objetos neste formato.
 */

export interface IAdminCategoryRecord {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  productCount: number;
}

export interface ICategoryFieldErrors {
  name?: string;
  slug?: string;
  sortOrder?: string;
}

export interface ICategoryFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors: ICategoryFieldErrors;
}

export const categoryFormInitialState: ICategoryFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export type TCategoryNotice = "created" | "updated";
