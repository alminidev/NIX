const checkoutHost = "checkout.infinitepay.io";

/** URL de checkout da InfinitePay. Recusa qualquer outro host. */
export function isInfinitePayCheckoutUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === checkoutHost;
  } catch {
    return false;
  }
}

/** Comprovante só entra se for HTTPS e couber no campo. */
export function readReceiptUrl(value: unknown) {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.href.length > 500) return null;
    return url.href;
  } catch {
    return null;
  }
}
