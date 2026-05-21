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
      <div className=""></div>
      <div className=""></div>
      <div className="sm:mx-auto w-fit">
        <Logo />
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 overflow-clip">
        <div className="bg-white  py-8 px-4 shadow-xl sm:rounded-lg sm:px-8 border border-gray-300">
          <nav className="flex w-full gap-9 my-3 px-5 border-b border-b-gray-400 mb-6">
            <button
              onClick={() => setActiveTab("register")}
              className={`text-center text-xl transition-colors font-bold font-dm-sans ${
                activeTab === "register"
                  ? "text-[#4B6F52]  border-b-[#4B6F52] border-b-2"
                  : "text-[#0A140F] hover:text-[#0A140F]"
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setActiveTab("login")}
              className={`text-center text-xl transition-colors font-bold font-dm-sans ${
                activeTab === "login"
                  ? "text-[#4B6F52] border-b-[#4B6F52] border-b-2"
                  : "text-[#0A140F] hover:text-[#0A140F]"
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
