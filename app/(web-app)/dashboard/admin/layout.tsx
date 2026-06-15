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
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      router.replace("/dashboard/user");
    }
  }, [router, isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-white">
        <SpinnerLoader size="size-20" border="border-6" />
        <p className="text-slate-600 mt-4">Checking authentication</p>
      </div>
    );
  }

  if (isAuthenticated && user?.role === "admin") {
    return (
      <DashboardLayout links={adminLinks} role="Admin">
        {children}
      </DashboardLayout>
    );
  }

  return null;
}
