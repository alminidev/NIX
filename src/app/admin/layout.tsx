import AdminGate from "@/views/AdminView/components/AdminGate";
import { Suspense } from "react";
import "./admin.css";

interface IAdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: IAdminLayoutProps) {
  return (
    <Suspense
      fallback={
        <p className="admin-status admin-pending">Carregando sessão…</p>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
