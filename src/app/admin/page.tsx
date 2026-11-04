import { parseDashboardMonth } from "@/lib/dashboard-month";
import { getDashboardMetrics } from "@/lib/dashboard";
import { getSession } from "@/lib/session";
import { AdminView } from "@/views/AdminView";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

interface IAdminPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function Admin({ searchParams }: IAdminPageProps) {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const period = parseDashboardMonth(await searchParams);
  const metrics = await getDashboardMetrics(period.month);

  return <AdminView metrics={metrics} period={period} />;
}

export default function AdminWrapper({ searchParams }: IAdminPageProps) {
  return (
    <Suspense
      fallback={
        <p className="grid min-h-screen place-items-center bg-surface-canvas-fog text-[0.9375rem] text-ink-muted">
          Carregando dados…
        </p>
      }
    >
      <Admin searchParams={searchParams} />
    </Suspense>
  );
}
