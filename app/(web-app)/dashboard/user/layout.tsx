"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { SpinnerLoader } from "@/components/ui/Loader";
import { useEffect } from "react";

const links = [
  { href: "/dashboard/user", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/user/edit-profile", label: "Edit Profile", icon: "User" },
  { href: "/dashboard/user/find-centre", label: "Find Centre", icon: "MapPin" },

  {
    href: "/dashboard/user/report-issues",
    label: "Report Issue",
    icon: "AlertTriangle",
  },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-white">
        <SpinnerLoader size="size-20" border="border-6" />
        <p className="text-slate-600 mt-4">Checking authentication</p>
      </div>
    );
  }

  if (isAuthenticated && user?.role === "user") {
    return <DashboardLayout links={links} role="User" children={children} />;
  }

  return null;
}
