import { Suspense } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminShell from '@/components/admin/AdminShell';
import { getSession } from '@/lib/session';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="admin-status admin-pending">Carregando sessão…</p>}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (session?.user.role !== 'admin') {
    return <AdminLogin />;
  }

  return (
    <AdminShell user={{ name: session.user.name, email: session.user.email }}>{children}</AdminShell>
  );
}
