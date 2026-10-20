import type { Metadata } from 'next';
import Dashboard from '@/components/admin/Dashboard';
import { getDashboardMetrics } from '@/lib/dashboard';
import { getSession } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Dashboard — NIX 3D',
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function AdminPage() {
  const session = await getSession();

  if (session?.user.role !== 'admin') {
    return null;
  }

  const metrics = await getDashboardMetrics();

  return <Dashboard metrics={metrics} />;
}
