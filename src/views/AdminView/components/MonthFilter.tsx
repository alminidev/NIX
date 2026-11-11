"use client";

import {
  buildDashboardHref,
  dashboardAllMonths,
  formatDashboardMonth,
  shiftDashboardMonth,
} from "@/lib/dashboard-month";
import type { IDashboardPeriod } from "@/types/dashboard";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface IMonthFilterProps {
  period: IDashboardPeriod;
}

interface IStepProps {
  href: string | null;
  label: string;
  direction: "left" | "right";
}

/** Meses listados no seletor, do atual para trás. */
const monthCount = 24;

const stepClass =
  "grid w-10 place-items-center text-ink-secondary transition-colors hover:bg-brand-blue-subtle hover:text-brand-blue-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-border-focus";

function listedMonths(currentMonth: string, selected: string | null) {
  const months: string[] = [];
  let cursor = currentMonth;

  for (let index = 0; index < monthCount; index += 1) {
    months.push(cursor);
    cursor = shiftDashboardMonth(cursor, -1);
  }

  if (selected && !months.includes(selected)) months.push(selected);

  return months;
}

function Step({ href, label, direction }: IStepProps) {
  const icon =
    direction === "left" ? (
      <ChevronLeft size={18} aria-hidden />
    ) : (
      <ChevronRight size={18} aria-hidden />
    );

  if (!href) {
    return (
      <button
        type="button"
        disabled
        aria-label={label}
        className={`${stepClass} cursor-default text-ink-muted opacity-40 hover:bg-transparent`}
      >
        {icon}
      </button>
    );
  }

  return (
    <Link href={href} scroll={false} aria-label={label} className={stepClass}>
      {icon}
    </Link>
  );
}

/**
 * Período da dashboard. A troca de mês navega na hora; as setas andam um mês
 * e o menu cobre os últimos 24, mais “todos os meses”.
 */
export default function MonthFilter({ period }: IMonthFilterProps) {
  const router = useRouter();
  const month = period.month;
  const previous = month ? shiftDashboardMonth(month, -1) : null;
  const next = month ? shiftDashboardMonth(month, 1) : null;
  const canGoNext = Boolean(next && next <= period.currentMonth);
  const value = month ?? dashboardAllMonths;

  function changeMonth(nextValue: string) {
    if (nextValue === value) return;

    router.push(
      buildDashboardHref(nextValue === dashboardAllMonths ? null : nextValue),
      { scroll: false },
    );
  }

  return (
    <div className="ml-auto flex w-fit flex-col items-end gap-1.5">
      <span
        id="periodo-pedidos"
        className="text-[0.8125rem] font-semibold text-ink-secondary"
      >
        Período
      </span>
      <div
        className="inline-flex h-11 items-stretch overflow-hidden rounded-pill border border-border-hairline bg-surface-card"
        role="group"
        aria-labelledby="periodo-pedidos"
      >
        <Step
          href={previous ? buildDashboardHref(previous) : null}
          label="Mês anterior"
          direction="left"
        />
        <div className="relative flex items-center border-x border-border-hairline">
          <select
            aria-label="Escolher o mês"
            value={value}
            onChange={(event) => changeMonth(event.target.value)}
            className="h-full min-w-44 cursor-pointer appearance-none bg-transparent pr-8 pl-3 text-center text-sm font-semibold text-ink-primary focus-visible:bg-brand-blue-subtle focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-border-focus"
          >
            <option value={dashboardAllMonths}>Todos os meses</option>
            {listedMonths(period.currentMonth, month).map((item) => (
              <option key={item} value={item}>
                {formatDashboardMonth(item)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            aria-hidden
            className="pointer-events-none absolute right-2.5 text-ink-muted"
          />
        </div>
        <Step
          href={canGoNext && next ? buildDashboardHref(next) : null}
          label="Próximo mês"
          direction="right"
        />
      </div>
    </div>
  );
}
