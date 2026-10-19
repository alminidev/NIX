/**
 * URL oficial de checkout / carrinho (InfinitePay).
 * Sobrescreva via NEXT_PUBLIC_CART_URL no .env.local.
 */
export const CART_URL =
  process.env.NEXT_PUBLIC_CART_URL ?? 'https://checkout.infinitepay.io/nix3d';
