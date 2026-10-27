/**
 * Contrato do pedido. createOrder() em lib/orders.ts recebe IOrderInput e
 * devolve IOrderCreated; readCheckoutForm() em lib/order-input.ts monta o
 * IOrderInput a partir do formulário do carrinho.
 */

import type { OrderSource } from "@/generated/prisma/enums";
import type { ICartItem } from "@/types/cart";

export interface IOrderCustomer {
  name: string;
  email: string;
  /** Só dígitos, com DDD */
  phone: string;
}

export interface IOrderAddress {
  /** CEP, só dígitos (8) */
  postalCode: string;
  street: string;
  number: string;
  /** Vazio quando não há complemento */
  complement: string;
  neighborhood: string;
  city: string;
  /** Sigla da UF (ex: 'SP') */
  state: string;
}

export interface IOrderInput {
  items: ICartItem[];
  customer: IOrderCustomer;
  address: IOrderAddress;
  /** Frete em reais; null enquanto não houver cotação */
  shipping: number | null;
  /** Padrão: SITE */
  source?: OrderSource;
}

export interface IOrderCreated {
  id: number;
  subtotal: number;
  shipping: number | null;
  total: number;
}

export interface ICheckoutFieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  postalCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  items?: string;
}

export interface ICheckoutFormState {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors: ICheckoutFieldErrors;
  /** Número do pedido criado */
  orderId: number | null;
}

export const checkoutFormInitialState: ICheckoutFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  orderId: null,
};
