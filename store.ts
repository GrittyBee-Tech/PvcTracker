"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect } from "react";

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

export default useStore;
