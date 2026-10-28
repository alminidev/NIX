import { isOrderStatus } from "@/lib/order-status";
import type { IAdminOrderFilters } from "@/types/admin-order";

/** Pedidos por página na lista do painel. */
export const adminOrdersPageSize = 20;

/** Tamanho máximo da busca por cliente, e-mail ou número. */
export const adminOrderSearchMaxLength = 100;

/** Maior valor que cabe no id (Int) do banco. */
const maxOrderId = 2_147_483_647;

/** Brasília não tem horário de verão desde 2019: o dia vai de -03:00 a -03:00. */
const dayOffset = "-03:00";

type TRawSearchParams = Record<string, string | string[] | undefined>;

function readParam(raw: TRawSearchParams, key: string) {
  const value = raw[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

/** Aceita só datas reais no formato AAAA-MM-DD (rejeita 2026-02-31). */
function parseDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10) === value ? value : null;
}

/** Lê e valida os searchParams da lista; valores inválidos são ignorados. */
export function parseOrderFilters(raw: TRawSearchParams): IAdminOrderFilters {
  const status = readParam(raw, "status");
  const page = Number(readParam(raw, "page"));

  return {
    q: readParam(raw, "q").slice(0, adminOrderSearchMaxLength),
    status: isOrderStatus(status) ? status : null,
    from: parseDay(readParam(raw, "from")),
    to: parseDay(readParam(raw, "to")),
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

/** Início do dia `from` (inclusive) e início do dia seguinte a `to`. */
export function getOrderDateRange(filters: IAdminOrderFilters) {
  const gte = filters.from
    ? new Date(`${filters.from}T00:00:00${dayOffset}`)
    : null;

  let lt: Date | null = null;
  if (filters.to) {
    lt = new Date(`${filters.to}T00:00:00${dayOffset}`);
    lt.setUTCDate(lt.getUTCDate() + 1);
  }

  return { gte, lt };
}

/** Número do pedido digitado na busca (aceita "#12"); null se não for um. */
export function parseOrderIdSearch(query: string) {
  const match = /^#?(\d{1,10})$/.exec(query.trim());
  if (!match) return null;

  const id = Number(match[1]);
  return id >= 1 && id <= maxOrderId ? id : null;
}

/** Link da lista com os filtros atuais, trocando a página. */
export function buildOrdersHref(filters: IAdminOrderFilters, page: number) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export function hasOrderFilters(filters: IAdminOrderFilters) {
  return Boolean(filters.q || filters.status || filters.from || filters.to);
}
