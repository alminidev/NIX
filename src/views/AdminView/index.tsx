import { IDashboardMetrics } from "@/types/dashboard";
import Dashboard from "@/views/AdminView/components/Dashboard";

interface IAdminViewProps {
  metrics: IDashboardMetrics;
}

export function AdminView({ metrics }: IAdminViewProps) {
  return <Dashboard metrics={metrics} />;
}
