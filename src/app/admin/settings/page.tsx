import FreshNavigation from "@/components/FreshNavigation";
import { getSession } from "@/lib/session";
import { centralDoFreteSetup } from "@/lib/shipping-central-do-frete";
import { melhorEnvioSetup } from "@/lib/shipping-melhor-envio";
import { defaultShippingProvider } from "@/lib/shipping-provider";
import {
  getProductionTimeTemplate,
  getShippingProvider,
} from "@/lib/shop-settings";
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

async function readShippingProvider() {
  try {
    return { provider: await getShippingProvider(), ready: true };
  } catch {
    console.error("Não foi possível ler o provedor de frete.");
    return { provider: defaultShippingProvider, ready: false };
  }
}

async function Settings({ searchParams }: ISettingsPageProps) {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const [params, productionTimeTemplate, shippingProvider] = await Promise.all([
    searchParams,
    getProductionTimeTemplate(),
    readShippingProvider(),
  ]);

  return (
    <AdminSettingsView
      settings={{
        productionTimeTemplate,
        shippingProvider: shippingProvider.provider,
        shippingSettingsReady: shippingProvider.ready,
        shippingSetup: {
          melhor_envio: melhorEnvioSetup(),
          central_do_frete: centralDoFreteSetup(),
        },
      }}
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
