"use client";

import LoginForm from "@/components/auth/user/LoginForm";
import RegisterForm from "@/components/auth/user/RegisterForm";
import Logo from "@/components/ui/Logo";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function AuthPortalContent() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("register");
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "user";

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="hero-grid absolute inset-0 z-0"></div>
      <div className="hero-bg absolute inset-0 z-0"></div>
      <div className="sm:mx-auto w-fit">
        <Logo />
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 overflow-clip">
        <div className="bg-white/20 backdrop-blur-lg py-8 px-4 shadow-xl sm:rounded-lg sm:px-8 border border-green-500/20">
          <nav className="flex w-full gap-9 my-3 px-5 border-b border-b-gray-400 mb-6">
            <button
              onClick={() => setActiveTab("register")}
              className={`text-center text-xl transition-colors font-bold font-Montserrat ${
                activeTab === "register"
                  ? "text-green-400 border-b-green-400 border-b-2"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setActiveTab("login")}
              className={`text-center text-xl transition-colors font-bold font-Montserrat ${
                activeTab === "login"
                  ? "text-green-400 border-b-green-400 border-b-2"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Login
            </button>
          </nav>

          {/* Tab Content */}
          <div>
            {activeTab === "login" ? (
              <LoginForm />
            ) : (
              <RegisterForm role={role} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserAuth() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">Loading authentication portal...</div>
      }
    >
      <AuthPortalContent />
    </Suspense>
  );
}
