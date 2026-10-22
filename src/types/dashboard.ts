/**
 * Contrato de exibição do painel administrativo.
 * getDashboardMetrics() em lib/dashboard.ts devolve objetos neste formato.
 */

export interface IFeaturedProduct {
  name: string;
  category: string;
  price: number;
}

export interface IOutOfStockProduct {
  id: number;
  name: string;
  sku: string;
  category: string;
}

export interface IDashboardMetrics {
  orders: number;
  revenue: number;
  averageTicket: number | null;
  activeProducts: number;
  averagePrice: number | null;
  catalogValue: number;
  categories: number;
  featuredCount: number;
  featuredProducts: IFeaturedProduct[];
  outOfStock: IOutOfStockProduct[];
}
