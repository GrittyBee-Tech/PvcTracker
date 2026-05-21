"use client";

import Logo from "@/components/ui/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

function AuthPortalContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen relative flex flex-col justify-center bg-linear-to-b from-accent/40 to-background">
      <div className="sm:mx-auto w-fit">
        <Logo />
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 bg-white py-8 px-4 shadow-xl shadow-primary/10 sm:rounded-lg sm:px-8 border border-primary/70">
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
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function UserAuth({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">Loading authentication portal...</div>
      }
    >
      <AuthPortalContent children={children} />
    </Suspense>
  );
}
