/**
 * Contrato do gerenciamento de produtos no painel.
 * getAdminProducts() em lib/admin-products.ts devolve objetos neste formato.
 */

export interface IAdminCategory {
  id: number;
  name: string;
}

export interface IAdminProductImage {
  url: string;
  isPrimary: boolean;
}

export interface IAdminProduct {
  id: number;
  sku: string;
  name: string;
  categoryId: number;
  category: string;
  capacity: string;
  dimensions: string;
  /** Valor editável em pt-BR, sem símbolo (ex: '1.190,00') */
  price: string;
  formattedPrice: string;
  installments: string;
  description: string;
  specifications: string[];
  images: IAdminProductImage[];
  image: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
}

export interface IProductFieldErrors {
  sku?: string;
  name?: string;
  categoryId?: string;
  capacity?: string;
  dimensions?: string;
  price?: string;
  installments?: string;
  description?: string;
  specifications?: string;
  images?: string;
  sortOrder?: string;
}

export interface IProductFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors: IProductFieldErrors;
}

export const productFormInitialState: IProductFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export interface IDeleteProductState {
  status: "idle" | "error";
  message: string;
}

export const deleteProductInitialState: IDeleteProductState = {
  status: "idle",
  message: "",
};
