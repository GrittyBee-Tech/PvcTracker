"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout, {
  DashboardLink,
} from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

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
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      router.replace("/dashboard/user");
    }
  }, [router, isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">Checking authorization…</p>
      </div>
    );
  }

  if (isAuthenticated && user?.role === "admin") {
    return (
      <DashboardLayout links={adminLinks} role="Admin" children={children} />
    );
  }

  return null;
}
