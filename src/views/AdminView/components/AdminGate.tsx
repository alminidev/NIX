import { getSession } from "@/lib/session";
import AdminLogin from "@/views/AdminView/components/AdminLogin";
import AdminShell from "@/views/AdminView/components/AdminShell";

interface IAdminGateProps {
  children: React.ReactNode;
}

export default async function AdminGate({ children }: IAdminGateProps) {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return <AdminLogin />;
  }

  return (
    <AdminShell user={{ name: session.user.name, email: session.user.email }}>
      {children}
    </AdminShell>
  );
}
