import { getAdminNewOrderOptions } from "@/lib/admin-new-order";
import { getSession } from "@/lib/session";
import { AdminNewOrderView } from "@/views/AdminNewOrderView";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Novo pedido — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

async function NewOrder() {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const options = await getAdminNewOrderOptions();

  return <AdminNewOrderView {...options} />;
}

export default function NewOrderPage() {
  return (
    <Suspense
      fallback={
        <p className="text-[0.9375rem] text-ink-muted">
          Carregando formulário…
        </p>
      }
    >
      <NewOrder />
    </Suspense>
  );
}
