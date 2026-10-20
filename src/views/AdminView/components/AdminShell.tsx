"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface IAdminShellUser {
  name: string;
  email: string;
}

interface IAdminShellProps {
  user: IAdminShellUser;
  children: React.ReactNode;
}

export default function AdminShell({ user, children }: IAdminShellProps) {
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
    <div className="flex min-h-screen w-full flex-1 flex-col items-stretch bg-surface-canvas-fog min-[861px]:flex-row">
      <aside className="static flex h-auto w-full shrink-0 flex-col justify-between gap-6 border-b border-border-hairline bg-surface-card px-4 pt-5 pb-4 min-[861px]:sticky min-[861px]:top-0 min-[861px]:h-screen min-[861px]:w-[264px] min-[861px]:border-r min-[861px]:border-b-0">
        <div>
          <Link
            href="/admin"
            className="flex min-h-12 items-center px-2"
            aria-label="NIX — Dashboard"
          >
            <img
              src="/images/logo-nix.png"
              alt=""
              width={110}
              height={32}
              className="h-7 w-auto object-contain"
            />
          </Link>

          <nav className="mt-3 flex flex-col gap-1" aria-label="Painel administrativo">
            <p className="mx-2 mb-2 text-[0.6875rem] font-semibold tracking-[0.05em] text-ink-muted uppercase">
              Navegação
            </p>
            <Link
              href="/admin"
              className="flex min-h-11 items-center gap-2.5 rounded-pill border border-[rgba(23,107,255,0.2)] bg-brand-blue-subtle px-3 text-sm font-semibold text-brand-blue-hover transition-[background-color,color,border-color] duration-200 ease-nix hover:bg-brand-blue-subtle hover:text-brand-blue-hover"
              aria-current="page"
            >
              <LayoutDashboard size={18} aria-hidden />
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="mt-auto flex items-center gap-2.5 border-t border-border-hairline px-1 pt-4 pb-1">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-pill border border-[rgba(23,107,255,0.2)] bg-brand-blue-subtle text-sm font-bold text-brand-blue-hover"
              aria-hidden="true"
            >
              {inicial}
            </span>
            <div className="flex min-w-0 flex-col">
              <strong className="text-sm leading-[1.3] font-semibold text-ink-primary">
                {user.name}
              </strong>
              <span className="truncate text-xs leading-[1.4] text-ink-muted">
                {user.email}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-pill border border-transparent bg-transparent p-0 text-ink-secondary transition-[color,background-color] duration-200 ease-nix enabled:hover:bg-brand-blue-subtle enabled:hover:text-brand-blue-hover disabled:cursor-progress disabled:opacity-70"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label={signingOut ? "Saindo" : "Desconectar"}
            title="Desconectar"
          >
            <LogOut size={18} aria-hidden />
          </button>
        </div>
      </aside>

      <main className="flex w-full min-w-0 flex-1 flex-col px-5 pt-7 pb-12 min-[861px]:px-10 min-[861px]:pt-10 min-[861px]:pb-16">
        {children}
      </main>
    </div>
  );
}
