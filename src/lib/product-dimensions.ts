import type { IProductDimensions } from "@/types/product";

const dimensionFormat = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

/** Largest value accepted for a single side, in centimeters (Decimal(6,1)). */
export const maxDimension = 99_999.9;

/**
 * Formats the dimensions as shown on the product card: length x width x
 * height, in centimeters (e.g. '46 x 35 x 60 cm').
 */
export function formatDimensions({
  length,
  width,
  height,
}: IProductDimensions): string {
  return `${dimensionFormat.format(length)} x ${dimensionFormat.format(width)} x ${dimensionFormat.format(height)} cm`;
}

/** Value shown in the admin inputs (pt-BR, no unit). */
export function formatDimensionInput(value: number): string {
  return dimensionFormat.format(value);
}

/**
 * Reads a measurement typed in centimeters ('46', '46,5' or '46.5').
 * Returns null when the value is not a positive number with at most one
 * decimal place.
 */
export function parseDimension(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!/^\d+(\.\d)?$/.test(normalized)) return null;

  const value = Number(normalized);
  return value > 0 && value <= maxDimension ? value : null;
}
