/** Voltagens aceitas no carrinho, no checkout e no pedido. */
export const productVoltages = ["V110", "V220"] as const;

export type TProductVoltage = (typeof productVoltages)[number];

export const voltageLabels: Record<TProductVoltage, string> = {
  V110: "110V",
  V220: "220V",
};

export type TVoltageIssue = "missing" | "unexpected" | "invalid";

export function isProductVoltage(value: unknown): value is TProductVoltage {
  return productVoltages.some((voltage) => voltage === value);
}

export function sameCartVoltage(
  a: TProductVoltage | null | undefined,
  b: TProductVoltage | null | undefined,
) {
  return (a ?? null) === (b ?? null);
}

export function voltageLabel(
  voltage: TProductVoltage | null | undefined,
): string | null {
  if (!voltage) return null;
  return voltageLabels[voltage];
}

/** Nome exibido quando a linha tem voltagem. Sem voltagem, devolve só o nome. */
export function formatLineName(
  name: string,
  voltage: TProductVoltage | null | undefined,
) {
  const label = voltageLabel(voltage);
  return label ? `${name} · ${label}` : name;
}

/**
 * Conferência da voltagem contra o cadastro do produto.
 * Ausente é válido só quando o produto não exige a escolha.
 */
export function voltageIssue(
  requiresVoltage: boolean,
  voltage: unknown,
): TVoltageIssue | null {
  if (voltage === undefined || voltage === null) {
    return requiresVoltage ? "missing" : null;
  }

  if (!isProductVoltage(voltage)) {
    return requiresVoltage ? "invalid" : "unexpected";
  }

  return requiresVoltage ? null : "unexpected";
}

export function voltageIssueMessage(name: string, issue: TVoltageIssue) {
  if (issue === "unexpected") {
    return `${name} não tem variação de voltagem.`;
  }

  return `Escolha a voltagem (110V ou 220V) de ${name}.`;
}
