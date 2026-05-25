"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { href: "/dashboard/volunteer", label: "Dashboard", icon: "LayoutDashboard" },
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
  }, [router, isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">Checking authorization…</p>
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
