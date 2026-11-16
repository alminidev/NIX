export const productionTimePlaceholder = "{dias}";

export const defaultProductionTimeTemplate =
  "Após a compra o tempo de produção do produto é de {dias}.";

export const productionTimeTemplateHint =
  'Use {dias} no texto. O sistema troca por "1 dia" ou "5 dias".';

export const productionTimeOverrideHint =
  'Vazio usa o texto de Configurações. Use {dias} no texto. O sistema troca por "1 dia" ou "5 dias".';

export const productionDaysHint = "Vazio ou zero esconde o texto na loja.";

export const shopSettingsId = 1;

export const productionTimeLimits = {
  days: 365,
  template: 400,
} as const;

export function productionDaysPhrase(days: number) {
  return days === 1 ? "1 dia" : `${days} dias`;
}

/**
 * Texto da vitrine. Null, indefinido ou prazo ≤ 0 não renderizam nada.
 * Sem `{dias}` no modelo, o prazo entra no fim da frase para a página não quebrar.
 */
export function formatProductionTime(
  days: number | null | undefined,
  template?: string | null,
): string | null {
  if (typeof days !== "number" || !Number.isInteger(days) || days <= 0) {
    return null;
  }

  const phrase = productionDaysPhrase(days);
  const source = template?.trim() || defaultProductionTimeTemplate;

  if (!source.includes(productionTimePlaceholder)) {
    return `${source} ${phrase}`;
  }

  return source.replaceAll(productionTimePlaceholder, phrase);
}

/** Prévia do admin. Sem `{dias}` no rascunho, devolve null em vez de inventar a frase. */
export function productionTimePreview(
  days: number,
  template?: string | null,
): string | null {
  const source = template?.trim() ?? "";
  if (!source.includes(productionTimePlaceholder)) return null;
  return formatProductionTime(days, source);
}

export function catalogProductionTime(
  productionDays: number | null,
  productionTimeTemplate: string | null,
  globalTemplate: string,
) {
  const override = productionTimeTemplate?.trim() ?? "";

  return {
    productionDays,
    productionTimeText: formatProductionTime(
      productionDays,
      override || globalTemplate,
    ),
  };
}

export function parseProductionDays(
  raw: string,
): { value: number | null } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null };
  if (!/^\d+$/.test(trimmed)) {
    return { error: "Informe um número inteiro de dias." };
  }

  const value = Number(trimmed);
  if (value > productionTimeLimits.days) {
    return {
      error: `O tempo de produção pode ter no máximo ${productionTimeLimits.days} dias.`,
    };
  }

  return { value };
}

export function parseProductionTimeTemplate(
  raw: string,
  options: { allowEmpty: boolean },
): { value: string | null } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    if (options.allowEmpty) return { value: null };
    return { error: "Informe o texto e inclua {dias}." };
  }

  if (trimmed.length > productionTimeLimits.template) {
    return {
      error: `O texto pode ter no máximo ${productionTimeLimits.template} caracteres.`,
    };
  }

  if (!trimmed.includes(productionTimePlaceholder)) {
    return {
      error:
        'Inclua {dias} no texto. O sistema troca por "1 dia" ou "5 dias".',
    };
  }

  return { value: trimmed };
}
