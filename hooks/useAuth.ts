"use client";

import { authClient } from "@/lib/auth-client";
import { UserType } from "@/models/users";

interface AuthSession {
  user: UserType | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthSession {
  const { data: session, isPending, error } = authClient.useSession();

  // 3. Fallback safely if a network error occurs or the user is unauthenticated
  if (isPending) {
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
    };
  }

  if (error || !session?.user) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }

  // 4. Return your exact custom object interface to the rest of your app
  return {
    user: session.user as AuthSession["user"], // Typecasted cleanly to match your strict union roles
    isLoading: false,
    isAuthenticated: true,
  };
}

export { authClient };
