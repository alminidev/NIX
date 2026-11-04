import type { IDashboardPeriod } from "@/types/dashboard";

/** Brasília não tem horário de verão desde 2019: o mês vai de -03:00 a -03:00. */
const dayOffset = "-03:00";

/** Valor do searchParam que mostra pedidos de qualquer mês. */
export const dashboardAllMonths = "all";

type TRawSearchParams = Record<string, string | string[] | undefined>;

function readParam(raw: TRawSearchParams, key: string) {
  const value = raw[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

/** YYYY-MM real (rejeita 2026-13). */
export function isDashboardMonth(value: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/** Mês civil atual em Brasília, no formato YYYY-MM. */
export function currentDashboardMonth(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}-${month}`;
}

/** "Novembro de 2026". */
export function formatDashboardMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Soma meses preservando o ano (dezembro + 1 vira janeiro). */
export function shiftDashboardMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Lê o mês da dashboard. Sem parâmetro, mês inválido ou mês futuro cai no mês
 * atual. `month=all` mostra todos os meses.
 */
export function parseDashboardMonth(
  raw: TRawSearchParams,
  now = new Date(),
): IDashboardPeriod {
  const currentMonth = currentDashboardMonth(now);
  const value = readParam(raw, "month");

  if (value === dashboardAllMonths) {
    return { month: null, label: null, currentMonth };
  }

  const requested = isDashboardMonth(value) ? value : currentMonth;
  const month = requested > currentMonth ? currentMonth : requested;

  return { month, label: formatDashboardMonth(month), currentMonth };
}

/** Início do mês (inclusive) e início do mês seguinte, em Brasília. */
export function getDashboardMonthRange(month: string) {
  if (!isDashboardMonth(month)) return null;

  return {
    gte: new Date(`${month}-01T00:00:00${dayOffset}`),
    lt: new Date(`${shiftDashboardMonth(month, 1)}-01T00:00:00${dayOffset}`),
  };
}

/** Primeiro e último dia do mês, para a lista de pedidos (dias inclusivos). */
export function dashboardMonthBounds(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();

  return {
    from: `${month}-01`,
    to: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function buildDashboardHref(month: string | null) {
  if (!month) return `/admin?month=${dashboardAllMonths}`;
  return `/admin?month=${month}`;
}

/** Lista de pedidos no mesmo recorte da dashboard. */
export function buildDashboardOrdersHref(
  month: string | null,
  extra: { status?: string; review?: boolean } = {},
) {
  const params = new URLSearchParams();

  if (extra.status) params.set("status", extra.status);
  if (extra.review) params.set("review", "1");

  if (month) {
    const { from, to } = dashboardMonthBounds(month);
    params.set("from", from);
    params.set("to", to);
  }

  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}
