"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  role: "user" | "admin" | "volunteer";
  nin?: string;
  vin?: string;
  ninVerified: boolean;
}

type Store = {
  user: User | null;
  setUser: (value: User) => void;
  clearUser: () => void;
  isHydrated: boolean;
};

const emptyUser: User = {
  email: "",
  firstName: "",
  lastName: "",
  dateOfBirth: new Date(),
  gender: "",
  phoneNumber: "",
  isEmailVerified: false,
  role: "user",
  ninVerified: false,
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      user: null,
      isHydrated: false,
      setUser: (value: User) => set({ user: value }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "pvc-waka-user",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    },
  ),
);

/**
 * Hook to sync NextAuth session with Zustand store
 * Call this in your root layout or app component
 */
export function useSyncSession() {
  const { data: session } = useSession();
  const { setUser, clearUser } = useStore();

  useEffect(() => {
    if (session?.user) {
      setUser(session.user as unknown as User);
    } else {
      clearUser();
    }
  }, [session, setUser, clearUser]);
}

/**
 * Hook to access auth context from either Zustand store or NextAuth session
 * Prefers Zustand store (cached) but falls back to NextAuth session
 */
export function useAuthContext() {
  const { user } = useStore();
  const { data: session } = useSession();

  return {
    user: user || (session?.user as User | undefined),
    isLoading: !useStore.getState().isHydrated,
  };
}

export default useStore;
