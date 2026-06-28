"use client";

import DashboardLayout, {
  DashboardLink,
} from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

const adminLinks: DashboardLink[] = [
  { href: "/dashboard/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/admin/admins", label: "Admins", icon: "ShieldCheck" },
  { href: "/dashboard/admin/users", label: "Users", icon: "Users" },
  { href: "/dashboard/admin/volunteers", label: "Volunteers", icon: "UserCheck" },
  { href: "/dashboard/admin/centres", label: "Centres", icon: "MapPin" },
  { href: "/dashboard/admin/audit-logs", label: "Audit Logs", icon: "ClipboardList" },
  { href: "/dashboard/admin/settings", label: "Settings", icon: "Settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user?.role === "admin") {
    return (
      <DashboardLayout links={adminLinks} role="Admin">
        {children}
      </DashboardLayout>
    );
  }

  return null;
}
