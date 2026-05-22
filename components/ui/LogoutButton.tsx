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
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-primary text-primary hover:text-white cursor-pointer"
    >
      <LogOut />
      Sign Out
    </button>
  );
}
