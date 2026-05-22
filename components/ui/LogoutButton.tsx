// components/LogoutButton.tsx
"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/auth/login",
      redirect: true,
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-white hover:bg-green-900/40 hover:text-green-100 cursor-pointer"
    >
      <LogOut />
      Sign Out
    </button>
  );
}
