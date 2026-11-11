import { IDashboardMetrics, IDashboardPeriod } from "@/types/dashboard";
import Dashboard from "@/views/AdminView/components/Dashboard";

interface IAdminViewProps {
  metrics: IDashboardMetrics;
  period: IDashboardPeriod;
}

export function AdminView({ metrics, period }: IAdminViewProps) {
  return <Dashboard metrics={metrics} period={period} />;
}
