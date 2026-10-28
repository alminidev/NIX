"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface IAdminShellUser {
  name: string;
  email: string;
}

interface IAdminShellProps {
  user: IAdminShellUser;
  children: React.ReactNode;
}

const navItems: {
  href: string;
  label: string;
  icon: LucideIcon;
  exact: boolean;
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    href: "/admin/orders",
    label: "Pedidos",
    icon: ClipboardList,
    exact: false,
  },
  { href: "/admin/products", label: "Produtos", icon: Package, exact: false },
  { href: "/admin/stock", label: "Estoque", icon: Boxes, exact: true },
];

function isCurrent(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isProductEditor(pathname: string) {
  return (
    pathname === "/admin/products/new" ||
    /^\/admin\/products\/\d+$/.test(pathname)
  );
}

export default function AdminShell({ user, children }: IAdminShellProps) {
  const { signOut } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const inicial = user.name.trim().charAt(0).toUpperCase() || "A";
  const editor = isProductEditor(pathname);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col items-stretch bg-surface-canvas-fog min-[861px]:flex-row">
      <aside className="static flex h-auto w-full shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-hairline bg-surface-card px-4 py-3 min-[861px]:sticky min-[861px]:flex-col min-[861px]:flex-nowrap min-[861px]:items-stretch min-[861px]:justify-between min-[861px]:gap-6 min-[861px]:pt-5 min-[861px]:pb-4 min-[861px]:top-0 min-[861px]:h-screen min-[861px]:w-66 min-[861px]:border-r min-[861px]:border-b-0">
        <div className="contents min-[861px]:block">
          <Link
            href="/admin"
            className="order-1 flex min-h-12 items-center px-2 min-[861px]:order-none"
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

          <nav
            className="order-3 grid w-full grid-cols-4 gap-1 min-[861px]:order-none min-[861px]:mt-3 min-[861px]:flex min-[861px]:flex-col"
            aria-label="Painel administrativo"
          >
            <p className="mx-2 mb-2 hidden text-[0.6875rem] font-semibold tracking-wider text-ink-muted uppercase min-[861px]:block">
              Navegação
            </p>
            {navItems.map((item) => {
              const current = isCurrent(pathname, item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    current
                      ? "flex min-h-14 flex-col items-center justify-center gap-1 rounded-pill border border-[rgba(23,107,255,0.2)] bg-brand-blue-subtle px-1 text-xs font-semibold text-brand-blue-hover transition-[background-color,color,border-color] duration-200 ease-nix min-[861px]:min-h-11 min-[861px]:flex-row min-[861px]:justify-start min-[861px]:gap-2.5 min-[861px]:px-3 min-[861px]:text-sm"
                      : "flex min-h-14 flex-col items-center justify-center gap-1 rounded-pill border border-transparent px-1 text-xs font-semibold text-ink-secondary transition-[background-color,color,border-color] duration-200 ease-nix hover:bg-brand-blue-subtle hover:text-brand-blue-hover min-[861px]:min-h-11 min-[861px]:flex-row min-[861px]:justify-start min-[861px]:gap-2.5 min-[861px]:px-3 min-[861px]:text-sm"
                  }
                  aria-current={current ? "page" : undefined}
                >
                  <Icon size={18} aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="order-2 ml-auto flex items-center gap-2.5 min-[861px]:order-none min-[861px]:mt-auto min-[861px]:ml-0 min-[861px]:border-t min-[861px]:border-border-hairline min-[861px]:px-1 min-[861px]:pt-4 min-[861px]:pb-1">
          <div className="flex min-w-0 items-center gap-3" title={user.name}>
            <span
              className="grid size-9 shrink-0 place-items-center rounded-pill border border-[rgba(23,107,255,0.2)] bg-brand-blue-subtle text-sm font-bold text-brand-blue-hover"
              aria-hidden="true"
            >
              {inicial}
            </span>
            <div className="flex min-w-0 flex-col max-[860px]:sr-only">
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

      <main
        className={
          editor
            ? "flex w-full min-w-0 flex-1 flex-col"
            : "flex w-full min-w-0 flex-1 flex-col px-5 pt-7 pb-12 min-[861px]:px-10 min-[861px]:pt-10 min-[861px]:pb-16"
        }
      >
        {children}
      </main>
    </div>
  );
}
