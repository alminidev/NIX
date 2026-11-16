"use client";

import { saveProfile } from "@/app/admin/profile/actions";
import { passwordLimits, profileFieldLimits } from "@/lib/profile-input";
import {
  profileFormInitialState,
  type IAdminProfile,
} from "@/types/admin-profile";
import { useActionState, useState, type ReactNode } from "react";

interface IProfileFormProps {
  profile: IAdminProfile;
}

const fieldClass =
  "min-h-12 w-full rounded-input border border-border-hairline bg-white px-3.5 py-3 text-sm font-normal text-ink-primary focus:border-brand-blue focus:outline-2 focus:outline-offset-1 focus:outline-border-focus disabled:cursor-not-allowed disabled:opacity-70";

function controlClass(invalid: boolean) {
  return invalid ? `${fieldClass} border-[#9b1c1c]` : fieldClass;
}

export default function ProfileForm({ profile }: IProfileFormProps) {
  const [state, action, pending] = useActionState(
    saveProfile,
    profileFormInitialState,
  );
  const errors = state.fieldErrors;
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const emailChanged =
    email.trim().toLowerCase() !== profile.email.trim().toLowerCase();

  return (
    <form action={action}>
      <section className="overflow-hidden rounded-card border border-border-hairline bg-surface-card">
        <header className="flex items-start gap-3 border-b border-border-hairline px-5 py-4 min-[760px]:px-6">
          <span className="grid size-8 shrink-0 place-items-center rounded-pill bg-brand-blue-subtle text-[0.6875rem] font-bold tracking-[0.04em] text-brand-blue-hover">
            01
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-[-0.01em] text-ink-primary">
              Dados do perfil
            </h2>
            <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-muted">
              Nome e e-mail de acesso desta conta.
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
          <Field label="Nome" error={errors.name} errorId="profile-name-error">
            <input
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              maxLength={profileFieldLimits.name}
              autoComplete="name"
              disabled={pending}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "profile-name-error" : undefined}
              className={controlClass(Boolean(errors.name))}
            />
          </Field>

          <Field
            label="E-mail"
            error={errors.email}
            errorId="profile-email-error"
            hint={
              errors.email
                ? undefined
                : "É o e-mail usado para entrar no painel."
            }
            hintId="profile-email-hint"
          >
            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={profileFieldLimits.email}
              autoComplete="email"
              spellCheck={false}
              autoCapitalize="none"
              disabled={pending}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "profile-email-error" : "profile-email-hint"
              }
              className={controlClass(Boolean(errors.email))}
            />
          </Field>

          {emailChanged ? (
            <Field
              label="Senha atual"
              error={errors.currentPassword}
              errorId="profile-current-password-error"
              hint={
                errors.currentPassword
                  ? undefined
                  : "Confirme a senha atual para trocar o e-mail."
              }
              hintId="profile-current-password-hint"
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
                    : "profile-current-password-hint"
                }
                className={controlClass(Boolean(errors.currentPassword))}
              />
            </Field>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-brand-blue px-5 text-sm font-medium text-ink-inverse transition-[background-color,translate] duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover disabled:cursor-progress disabled:opacity-70"
            >
              {pending ? "Salvando…" : "Salvar perfil"}
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
        <span
          id={errorId}
          className="text-[0.8125rem] font-normal text-[#9b1c1c]"
        >
          {error}
        </span>
      ) : hint ? (
        <span
          id={hintId}
          className="text-[0.8125rem] font-normal text-ink-muted"
        >
          {hint}
        </span>
      ) : null}
    </label>
  );
}
