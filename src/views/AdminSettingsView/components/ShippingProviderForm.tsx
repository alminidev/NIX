"use client";

import { saveShippingProvider } from "@/app/admin/settings/actions";
import {
  shippingProviderOptions,
  type TShippingProvider,
} from "@/lib/shipping-provider";
import {
  settingsFormInitialState,
  type IShopSettings,
} from "@/types/admin-settings";
import { useActionState, useState } from "react";

interface IShippingProviderFormProps {
  settings: IShopSettings;
}

export default function ShippingProviderForm({
  settings,
}: IShippingProviderFormProps) {
  const [state, action, pending] = useActionState(
    saveShippingProvider,
    settingsFormInitialState,
  );
  const [provider, setProvider] = useState<TShippingProvider>(
    settings.shippingProvider,
  );
  const error = state.fieldErrors.shippingProvider;
  const setup = settings.shippingSetup[provider];
  const statusId = "shipping-provider-status";

  return (
    <form action={action}>
      <section className="overflow-hidden rounded-card border border-border-hairline bg-surface-card">
        <header className="flex items-start gap-3 border-b border-border-hairline px-5 py-4 min-[760px]:px-6">
          <span className="grid size-8 shrink-0 place-items-center rounded-pill bg-brand-blue-subtle text-[0.6875rem] font-bold tracking-[0.04em] text-brand-blue-hover">
            02
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-[-0.01em] text-ink-primary">
              Frete
            </h2>
            <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-muted">
              Escolhe quem cota a entrega. O token fica no servidor e não
              aparece aqui.
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
          <fieldset
            className="grid gap-3"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${statusId} shipping-provider-error` : statusId}
          >
            <legend className="text-[0.8125rem] font-semibold text-ink-secondary">
              Provedor ativo
            </legend>
            {shippingProviderOptions.map((option) => {
              const selected = provider === option.id;
              return (
                <label
                  key={option.id}
                  className={
                    selected
                      ? "flex min-h-11 cursor-pointer items-start gap-3 rounded-input border border-brand-blue bg-brand-blue-subtle px-3.5 py-3"
                      : "flex min-h-11 cursor-pointer items-start gap-3 rounded-input border border-border-hairline bg-white px-3.5 py-3"
                  }
                >
                  <input
                    type="radio"
                    name="shippingProvider"
                    value={option.id}
                    checked={selected}
                    onChange={() => setProvider(option.id)}
                    disabled={pending}
                    className="mt-0.5 size-4 shrink-0 accent-brand-blue"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink-primary">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-[0.8125rem] leading-relaxed font-normal text-ink-muted">
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          <p
            id={statusId}
            className="rounded-input border border-border-hairline bg-surface-canvas-fog px-3.5 py-3 text-[0.8125rem] leading-relaxed text-ink-secondary"
            aria-live="polite"
          >
            {setup.ready
              ? "Pronto para cotar. O token fica só no servidor."
              : setup.missing.length > 0
                ? `Ainda não dá para cotar com este provedor. Preencha no servidor: ${setup.missing.join(", ")}.`
                : "Ainda não dá para cotar com este provedor. As variáveis do servidor não estão prontas."}
          </p>
          {error ? (
            <span
              id="shipping-provider-error"
              className="text-[0.8125rem] font-normal text-[#9b1c1c]"
            >
              {error}
            </span>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-pill bg-brand-blue px-5 text-sm font-medium text-ink-inverse transition-[background-color,translate] duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover disabled:cursor-progress disabled:opacity-70 min-[760px]:w-auto"
            >
              {pending ? "Salvando…" : "Salvar frete"}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
