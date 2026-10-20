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

async function Admin() {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const metrics = await getDashboardMetrics();

  return <AdminView metrics={metrics} />;
}

export default async function AdminWrapper() {
  return (
    <Suspense
      fallback={
        <p className="grid min-h-screen place-items-center bg-surface-canvas-fog text-[0.9375rem] text-ink-muted">
          Carregando dados…
        </p>
      }
    >
      <Admin />
    </Suspense>
  );
}
