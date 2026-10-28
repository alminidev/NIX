/** Texto do prazo para a pessoa (ex.: "7 dias úteis"). */
export function formatDeliveryDays(days: number) {
  if (days === 0) return "No mesmo dia";
  if (days === 1) return "1 dia útil";
  return `${days} dias úteis`;
}

/** Rótulo gravado no pedido e mostrado no carrinho (ex.: "Correios · PAC"). */
export function formatShippingService(
  company: string | null,
  name: string | null,
) {
  const carrier = company?.trim() ?? "";
  const service = name?.trim() ?? "";
  if (!carrier && !service) return null;
  const label =
    carrier && service ? `${carrier} · ${service}` : carrier || service;
  return label.slice(0, 160);
}
