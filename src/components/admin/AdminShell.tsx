"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { LayoutDashboard, LogOut } from "lucide-react";
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
  const { signOut } = useAuthContext();
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
              <LayoutDashboard size={18} aria-hidden />
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
            <LogOut size={18} aria-hidden />
          </button>
        </div>
      </aside>

      <main className="admin-content">{children}</main>
    </div>
  );
}
