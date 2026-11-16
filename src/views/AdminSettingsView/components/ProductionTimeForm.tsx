"use client";

import { saveShopSettings } from "@/app/admin/settings/actions";
import {
  productionTimeLimits,
  productionTimePreview,
  productionTimeTemplateHint,
} from "@/lib/production-time";
import {
  settingsFormInitialState,
  type IShopSettings,
} from "@/types/admin-settings";
import { useActionState, useState } from "react";

interface IProductionTimeFormProps {
  settings: IShopSettings;
}

const fieldClass =
  "min-h-12 w-full rounded-input border border-border-hairline bg-white px-3.5 py-3 text-sm font-normal text-ink-primary focus:border-brand-blue focus:outline-2 focus:outline-offset-1 focus:outline-border-focus disabled:cursor-not-allowed disabled:opacity-70";

export default function ProductionTimeForm({
  settings,
}: IProductionTimeFormProps) {
  const [state, action, pending] = useActionState(
    saveShopSettings,
    settingsFormInitialState,
  );
  const [template, setTemplate] = useState(settings.productionTimeTemplate);
  const error = state.fieldErrors.productionTimeTemplate;
  const singular = productionTimePreview(1, template);
  const plural = productionTimePreview(5, template);

  return (
    <form action={action}>
      <section className="overflow-hidden rounded-card border border-border-hairline bg-surface-card">
        <header className="flex items-start gap-3 border-b border-border-hairline px-5 py-4 min-[760px]:px-6">
          <span className="grid size-8 shrink-0 place-items-center rounded-pill bg-brand-blue-subtle text-[0.6875rem] font-bold tracking-[0.04em] text-brand-blue-hover">
            01
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-[-0.01em] text-ink-primary">
              Tempo de produção
            </h2>
            <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-muted">
              Vale para todos os produtos. O prazo em dias continua em cada
              item.
            </p>
          </div>
        </header>

        {state.status === "error" ? (
          <p
            className="border-b border-[#f0c7c7] bg-[#fff1f1] px-5 py-3 text-sm text-[#9b1c1c] min-[760px]:px-6"
            role="alert"
          >
            {state.message}
          </p>
        ) : null}

        <div className="grid gap-5 px-5 py-5 min-[760px]:px-6">
          <label className="flex flex-col gap-2">
            <span className="text-[0.8125rem] font-semibold text-ink-secondary">
              Texto na vitrine
            </span>
            <textarea
              name="productionTimeTemplate"
              value={template}
              onChange={(event) => setTemplate(event.target.value)}
              required
              rows={3}
              maxLength={productionTimeLimits.template}
              disabled={pending}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error
                  ? "production-template-hint production-template-error"
                  : "production-template-hint"
              }
              className={
                error
                  ? `${fieldClass} min-h-28 resize-y border-[#9b1c1c]`
                  : `${fieldClass} min-h-28 resize-y`
              }
            />
            <span
              id="production-template-hint"
              className="text-[0.8125rem] font-normal text-ink-muted"
            >
              {productionTimeTemplateHint}
            </span>
            {error ? (
              <span
                id="production-template-error"
                className="text-[0.8125rem] font-normal text-[#9b1c1c]"
              >
                {error}
              </span>
            ) : null}
          </label>

          <div
            className="rounded-input border border-border-hairline bg-surface-canvas-fog px-3.5 py-3"
            aria-live="polite"
          >
            <p className="text-[0.6875rem] font-semibold tracking-[0.05em] text-ink-muted uppercase">
              Prévia
            </p>
            {singular && plural ? (
              <div className="mt-2 flex flex-col gap-1.5">
                <p className="text-[0.8125rem] leading-relaxed text-ink-secondary">
                  {singular}
                </p>
                <p className="text-[0.8125rem] leading-relaxed text-ink-secondary">
                  {plural}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                Inclua {"{dias}"} para ver a prévia.
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-brand-blue px-5 text-sm font-medium text-ink-inverse transition-[background-color,translate] duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover disabled:cursor-progress disabled:opacity-70"
            >
              {pending ? "Salvando…" : "Salvar configurações"}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
