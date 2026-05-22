"use client";

import { SessionProvider } from "next-auth/react";
import { useSyncSession } from "@/store";
import { ReactNode } from "react";

/**
 * App wrapper that provides NextAuth session context
 * and syncs it with Zustand store
 */
function SessionSyncProvider({ children }: { children: ReactNode }) {
  // This hook syncs NextAuth session with Zustand store on mount
  useSyncSession();

  return <>{children}</>;
}

export function AppSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SessionSyncProvider>{children}</SessionSyncProvider>
    </SessionProvider>
  );
}
