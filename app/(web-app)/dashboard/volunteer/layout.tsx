"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { SpinnerLoader } from "@/components/ui/Loader";

const links = [
  { href: "/dashboard/volunteer", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/volunteer/all-users", label: "All Users", icon: "Users" },
];

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role !== "volunteer") {
      router.replace("/dashboard/user");
    }
  }, [router, isAuthenticated, user?.role]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-white">
        <SpinnerLoader size="size-20" border="border-6" />
        <p className="text-slate-600 mt-4">Checking authentication</p>
      </div>
    );
  }

  if (isAuthenticated && user?.role === "volunteer") {
    return (
      <DashboardLayout links={links} role="Volunteer" children={children} />
    );
  }

  return null;
}
