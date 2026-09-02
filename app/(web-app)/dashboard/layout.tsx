"use client";

import { SpinnerLoader } from "@/components/ui/Loader";
import QueryProvider from "@/components/providers/QueryProvider";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    // Only redirect if visiting root "/dashboard" or "/dashboard/"
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      const destination =
        user?.role === "volunteer"
          ? "/dashboard/volunteer"
          : user?.role === "admin"
            ? "/dashboard/admin"
            : "/dashboard/user";

      router.replace(destination);
    }
  }, [isAuthenticated, router, isLoading, user?.role, pathname]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-white">
        <SpinnerLoader border="border-7" size="size-20" />
        <p className="text-xl text-slate-700 mt-6">Checking authentication…</p>
      </div>
    );
  }

  return <QueryProvider>{children}</QueryProvider>;
}
