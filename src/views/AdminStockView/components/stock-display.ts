export const unitsFormat = new Intl.NumberFormat("pt-BR");

const maxRed = "#9b1c1c";
const softRed = "#e7a3a3";

export type TStockDirection = "in" | "out";

export function stockTone(stock: number) {
  if (stock >= 2) return undefined;
  const level = (2 - Math.max(0, stock)) / 2;
  const percent = Math.round(level * 100);

  return {
    color: `color-mix(in srgb, ${maxRed} ${percent}%, ${softRed})`,
    backgroundColor: `color-mix(in srgb, #fff1f1 ${percent}%, transparent)`,
  };
}
