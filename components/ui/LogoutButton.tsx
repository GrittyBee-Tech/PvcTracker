// components/LogoutButton.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { LogOut, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton({ navOpen }: { navOpen: Boolean }) {
  const router = useRouter();
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/login"); // redirect to login page
        },
      },
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-2 md:px-4 md:py-3 rounded-lg transition-all duration-200 hover:bg-primary text-primary text-lg hover:text-white cursor-pointer"
    >
      <LogOut className="not-md:text-xl" />
      <span className={`${navOpen ? "block" : "hidden"} md:block`}>
        Sign Out
      </span>
    </button>
  );
}
