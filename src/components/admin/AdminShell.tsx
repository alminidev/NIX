"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminShellUser = {
  name: string;
  email: string;
};

export default function AdminShell({
  user,
  children,
}: {
  user: AdminShellUser;
  children: React.ReactNode;
}) {
  const { signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const inicial = user.name.trim().charAt(0).toUpperCase() || "A";

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <Link
            href="/admin"
            className="admin-brand"
            aria-label="NIX — Dashboard"
          >
            <img src="/images/logo-nix.png" alt="" width={110} height={32} />
          </Link>

          <nav className="admin-nav" aria-label="Painel administrativo">
            <p className="admin-nav-label">Navegação</p>
            <Link
              href="/admin"
              className="admin-nav-link is-active"
              aria-current="page"
            >
              <svg
                viewBox="0 0 24 24"
                width={18}
                height={18}
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
              </svg>
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="admin-account">
          <div className="admin-account-id">
            <span className="admin-avatar" aria-hidden="true">
              {inicial}
            </span>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button
            type="button"
            className="admin-signout"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label={signingOut ? "Saindo" : "Desconectar"}
            title="Desconectar"
          >
            <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      <main className="admin-content">{children}</main>
    </div>
  );
}
