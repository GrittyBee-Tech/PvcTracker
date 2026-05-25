"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const links = [
  { href: "/dashboard/volunteer", label: "Dashboard", icon: "LayoutDashboard" },
];

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "volunteer") {
      router.replace("/dashboard/user");
    }
  }, [router, session, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">Checking authorization…</p>
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role === "volunteer") {
    return (
      <DashboardLayout links={links} role="Volunteer">
        {children}
      </DashboardLayout>
    );
  }

  return null;
}
