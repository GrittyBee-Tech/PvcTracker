"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout, {
  DashboardLink,
} from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { SpinnerLoader } from "@/components/ui/Loader";

const adminLinks: DashboardLink[] = [
  { href: "/dashboard/admin", label: "Dashboard", icon: "Home" },
  { href: "/dashboard/admin/users", label: "Users", icon: "Users" },
  { href: "/dashboard/admin/settings", label: "Settings", icon: "Settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
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
