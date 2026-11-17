"use client";

import { changeOwnPassword } from "@/app/admin/profile/actions";
import { passwordLimits } from "@/lib/profile-input";
import { passwordFormInitialState } from "@/types/admin-profile";
import { useActionState, type ReactNode } from "react";

const fieldClass =
  "min-h-12 w-full rounded-input border border-border-hairline bg-white px-3.5 py-3 text-sm font-normal text-ink-primary focus:border-brand-blue focus:outline-2 focus:outline-offset-1 focus:outline-border-focus disabled:cursor-not-allowed disabled:opacity-70";

function controlClass(invalid: boolean) {
  return invalid ? `${fieldClass} border-[#9b1c1c]` : fieldClass;
}

export default function PasswordForm() {
  const [state, action, pending] = useActionState(
    changeOwnPassword,
    passwordFormInitialState,
  );
  const errors = state.fieldErrors;

  return (
    <form action={action}>
      <section className="overflow-hidden rounded-card border border-border-hairline bg-surface-card">
        <header className="flex items-start gap-3 border-b border-border-hairline px-5 py-4 min-[760px]:px-6">
          <span className="grid size-8 shrink-0 place-items-center rounded-pill bg-brand-blue-subtle text-[0.6875rem] font-bold tracking-[0.04em] text-brand-blue-hover">
            02
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-[-0.01em] text-ink-primary">
              Senha
            </h2>
            <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-muted">
              A senha atual é conferida antes de gravar a nova.
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
          <Field
            label="Senha atual"
            error={errors.currentPassword}
            errorId="profile-current-password-error"
          >
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              maxLength={passwordLimits.max}
              disabled={pending}
              aria-invalid={Boolean(errors.currentPassword)}
              aria-describedby={
                errors.currentPassword
                  ? "profile-current-password-error"
                  : undefined
              }
              className={controlClass(Boolean(errors.currentPassword))}
            />
          </Field>

          <div className="grid items-start gap-5 min-[760px]:grid-cols-2">
            <Field
              label="Nova senha"
              error={errors.newPassword}
              errorId="profile-new-password-error"
              hint={
                errors.newPassword
                  ? undefined
                  : `Mínimo de ${passwordLimits.min} caracteres.`
              }
              hintId="profile-new-password-hint"
            >
              <input
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={passwordLimits.min}
                maxLength={passwordLimits.max}
                disabled={pending}
                aria-invalid={Boolean(errors.newPassword)}
                aria-describedby={
                  errors.newPassword
                    ? "profile-new-password-error"
                    : "profile-new-password-hint"
                }
                className={controlClass(Boolean(errors.newPassword))}
              />
            </Field>

            <Field
              label="Confirmar nova senha"
              error={errors.confirmPassword}
              errorId="profile-confirm-password-error"
            >
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={passwordLimits.min}
                maxLength={passwordLimits.max}
                disabled={pending}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword
                    ? "profile-confirm-password-error"
                    : undefined
                }
                className={controlClass(Boolean(errors.confirmPassword))}
              />
            </Field>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-brand-blue px-5 text-sm font-medium text-ink-inverse transition-[background-color,translate] duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover disabled:cursor-progress disabled:opacity-70"
            >
              {pending ? "Trocando…" : "Trocar senha"}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}

function Field({
  label,
  error,
  errorId,
  hint,
  hintId,
  children,
}: {
  label: string;
  error?: string;
  errorId?: string;
  hint?: string;
  hintId?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.8125rem] font-semibold text-ink-secondary">
        {label}
      </span>
      {children}
      {error ? (
        <span id={errorId} className="text-[0.8125rem] font-normal text-[#9b1c1c]">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="text-[0.8125rem] font-normal text-ink-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
