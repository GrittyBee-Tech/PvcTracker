"use client";

import { SpinnerLoader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace("/auth/login");
    } else {
      const destination =
        user?.role === "volunteer"
          ? "/dashboard/volunteer"
          : user?.role === "admin"
            ? "/dashboard/admin"
            : "/dashboard/user";

      router.replace(destination);
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-white">
        <SpinnerLoader border="border-7" size="size-20" />
        <p className="text-xl text-slate-700 mt-6">Checking authentication…</p>
      </div>
    );
  }

  return <>{children}</>;
}
