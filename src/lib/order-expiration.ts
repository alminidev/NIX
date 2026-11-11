export const defaultOrderExpirationMinutes = 60;

/**
 * Tempo, em minutos, que um pedido aguardando pagamento segura o estoque.
 * Configurável por ORDER_EXPIRATION_MINUTES; valor ausente ou inválido usa o
 * padrão.
 */
export function getOrderExpirationMinutes(
  value: string | undefined = process.env.ORDER_EXPIRATION_MINUTES,
): number {
  const minutes = Number(value);

  return Number.isInteger(minutes) && minutes > 0
    ? minutes
    : defaultOrderExpirationMinutes;
}

export function calculateExpiresAt(
  now: Date,
  minutes: number = getOrderExpirationMinutes(),
): Date {
  return new Date(now.getTime() + minutes * 60_000);
}
