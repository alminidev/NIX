/**
 * Contrato da página de estoque.
 * getStockProducts() em lib/admin-stock.ts devolve objetos neste formato.
 */

export interface IStockProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  capacity: string;
  image: string;
  active: boolean;
  stock: number;
}

export interface IAdjustStockState {
  status: "idle" | "error" | "success";
  message: string;
}

export const adjustStockInitialState: IAdjustStockState = {
  status: "idle",
  message: "",
};
