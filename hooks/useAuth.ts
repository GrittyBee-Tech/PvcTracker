"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role?: "user" | "admin" | "volunteer";
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthSession {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    async function getSession() {
      try {
        const { data } = await authClient.getSession();
        if (!data) return;
        if (data.user) {
          setSession({
            user: data.user as AuthSession["user"],
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setSession({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        setSession({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    }

    getSession();
  }, []);

  return session;
}

export { authClient };
