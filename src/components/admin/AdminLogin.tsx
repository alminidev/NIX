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
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit} noValidate>
        <img src="/images/logo-nix.png" alt="NIX" width={110} height={32} />
        <div>
          <p className="kicker">Acesso restrito</p>
          <h1>Entrar no painel</h1>
        </div>

        <label className="admin-field">
          <span>E-mail</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={submitting}
          />
        </label>

        <label className="admin-field">
          <span>Senha</span>
          <input
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
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          className="btn-primary admin-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
