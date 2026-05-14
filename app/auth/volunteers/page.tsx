"use client";

import LoginForm from "@/components/auth/volunteer/LoginForm";
import RegisterForm from "@/components/auth/volunteer/RegisterForm";
import { useState } from "react";

export default function VolunteerAuth() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("register");
  return (
    <div>
      <nav className="flex w-full gap-9 my-3 px-5 border-b border-b-gray-400 mb-6">
        <button
          onClick={() => setActiveTab("register")}
          className={`text-center text-xl transition-colors font-bold font-Montserrat ${
            activeTab === "register"
              ? "text-green-700 border-b-primary border-b-2"
              : "text-black"
          }`}
        >
          Register
        </button>
        <button
          onClick={() => setActiveTab("login")}
          className={`text-center text-xl transition-colors font-bold font-Montserrat ${
            activeTab === "login"
              ? "text-green-700 border-b-primary border-b-2"
              : "text-black"
          }`}
        >
          Login
        </button>
      </nav>

      {/* Tab Content */}
      <div>{activeTab === "login" ? <LoginForm /> : <RegisterForm />}</div>
    </div>
  );
}
