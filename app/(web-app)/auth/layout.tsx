"use client";

import Logo from "@/components/ui/Logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { SpinnerLoader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";

function AuthPortalContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen relative flex flex-col justify-center bg-linear-to-b from-accent/40 to-background">
      <div className="mx-auto w-fit mt-6">
        <Logo />
      </div>

      <div className="mt-4 mb-10 w-11/12 xs:w-10/12 xs:max-w-xl mx-auto relative z-10 bg-white py-8 px-4 shadow-xl shadow-gray-300 rounded-lg sm:px-8 border border-gray-300">
        <nav className="flex w-full gap-9 my-3 px-5 border-b border-b-gray-400 mb-6">
          <Link
            href={"/auth/register"}
            className={`text-center text-xl transition-colors font-bold font-dm-sans cursor-pointer ${
              pathname === "/auth/register"
                ? "text-primary border-primary border-b-2"
                : "text-gray-900"
            }`}
          >
            Register
          </Link>

          <Link
            href={"/auth/login"}
            className={`text-center text-xl transition-colors font-bold font-dm-sans cursor-pointer ${
              pathname === "/auth/login"
                ? "text-primary border-primary border-b-2"
                : "text-gray-900"
            }`}
          >
            Login
          </Link>
        </nav>
        <>{children}</>
      </div>
    </div>
  );
}

export default function UserAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard/user");
    }
  }, [pathname, isAuthenticated, router]);

  return (
    <Suspense fallback={<SpinnerLoader />}>
      <AuthPortalContent>{children}</AuthPortalContent>
    </Suspense>
  );
}
