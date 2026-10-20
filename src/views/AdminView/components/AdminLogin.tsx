"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLogin() {
  const { signIn } = useAuthContext();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn(email, password);

    if (result.error) {
      setSubmitting(false);
      setError(result.error);
      setPassword("");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid min-h-screen flex-1 place-items-center bg-surface-canvas-fog bg-[radial-gradient(circle_at_top,rgba(23,107,255,0.12),transparent_42%)] p-6">
      <form
        className="flex w-full max-w-[420px] flex-col gap-5 rounded-card border border-border-hairline bg-surface-card p-8 shadow-card-hover"
        onSubmit={handleSubmit}
        noValidate
      >
        <img src="/images/logo-nix.png" alt="NIX" width={110} height={32} />
        <div>
          <p className="mb-3 inline-block text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
            Acesso restrito
          </p>
          <h1 className="mt-1 text-[1.75rem] leading-[1.08] font-semibold tracking-[-0.03em] text-ink-primary">
            Entrar no painel
          </h1>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-ink-primary">
          <span>E-mail</span>
          <input
            className="min-h-12 w-full rounded-input border border-border-hairline bg-white px-3.5 py-3 font-normal text-ink-primary focus:border-brand-blue focus:outline-2 focus:outline-offset-1 focus:outline-border-focus"
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={submitting}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-ink-primary">
          <span>Senha</span>
          <input
            className="min-h-12 w-full rounded-input border border-border-hairline bg-white px-3.5 py-3 font-normal text-ink-primary focus:border-brand-blue focus:outline-2 focus:outline-offset-1 focus:outline-border-focus"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={submitting}
          />
        </label>

        {error ? (
          <p className="rounded-input bg-[#fff1f1] px-3.5 py-3 text-sm text-[#9b1c1c]" role="alert">
            {error}
          </p>
        ) : null}

        <button
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-brand-blue px-8 py-[14px] text-[0.9375rem] font-medium whitespace-nowrap text-ink-inverse transition-[background-color,translate] duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover active:translate-y-0 disabled:cursor-progress disabled:opacity-70"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
