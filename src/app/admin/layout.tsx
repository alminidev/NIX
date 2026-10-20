import AdminGate from "@/views/AdminView/components/AdminGate";
import { Suspense } from "react";

interface IAdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: IAdminLayoutProps) {
  return (
    <Suspense
      fallback={
        <p className="grid min-h-screen place-items-center bg-surface-canvas-fog text-[0.9375rem] text-ink-muted">
          Carregando sessão…
        </p>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
