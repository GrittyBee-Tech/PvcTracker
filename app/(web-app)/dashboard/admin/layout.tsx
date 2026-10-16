"use client";

import DashboardLayout, {
  DashboardLink,
} from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

const adminLinks: DashboardLink[] = [
  { href: "/dashboard/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/admin/admins", label: "Admins", icon: "ShieldCheck" },
  { href: "/dashboard/admin/users", label: "Users", icon: "Users" },
  // { href: "/dashboard/admin/volunteers", label: "Volunteers", icon: "UserCheck" },
  // { href: "/dashboard/admin/centres", label: "Centres", icon: "MapPin" },
  // { href: "/dashboard/admin/audit-logs", label: "Audit Logs", icon: "ClipboardList" },
  { href: "/dashboard/admin/settings", label: "Settings", icon: "Settings" },
];

const ALLOWED_ADMIN_PATHS = [
  "/dashboard/admin",
  "/dashboard/admin/users",
  "/dashboard/admin/admins",
  "/dashboard/admin/settings",
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();

  if (
    isAuthenticated &&
    user?.role === "admin" &&
    ALLOWED_ADMIN_PATHS.includes(pathname || "")
  ) {
    return (
      <DashboardLayout links={adminLinks} role="Admin">
        {children}
      </DashboardLayout>
    );
  }

  return null;
}
