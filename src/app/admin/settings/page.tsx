import FreshNavigation from "@/components/FreshNavigation";
import { getProductionTimeTemplate } from "@/lib/shop-settings";
import { getSession } from "@/lib/session";
import type { TSettingsNotice } from "@/types/admin-settings";
import { AdminSettingsView } from "@/views/AdminSettingsView";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Configurações — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

interface ISettingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readNotice(
  value: string | string[] | undefined,
): TSettingsNotice | null {
  const notice = Array.isArray(value) ? value[0] : value;
  if (notice === "saved") return notice;
  return null;
}

async function Settings({ searchParams }: ISettingsPageProps) {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const [params, productionTimeTemplate] = await Promise.all([
    searchParams,
    getProductionTimeTemplate(),
  ]);

  return (
    <AdminSettingsView
      settings={{ productionTimeTemplate }}
      notice={readNotice(params.notice)}
    />
  );
}

export default function SettingsPage({ searchParams }: ISettingsPageProps) {
  return (
    <FreshNavigation>
      <Suspense
        fallback={
          <p className="text-[0.9375rem] text-ink-muted">
            Carregando configurações…
          </p>
        }
      >
        <Settings searchParams={searchParams} />
      </Suspense>
    </FreshNavigation>
  );
}
