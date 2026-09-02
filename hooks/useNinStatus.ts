import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "better-auth";

export interface NinStatusData {
  paid: boolean;
  verified: boolean;
  reason: string;
  ninStatus: string;
  paymentStatus: string;
  isLoading: boolean;
  error: string | null;
}

interface NinStatusResponse {
  paymentStatus: "success" | "pending" | "failed";
  ninStatus: string;
  message: string;
}

export const ninStatusQueryKey = (userId?: string) => ["nin-status", userId];

async function fetchNinStatus(): Promise<NinStatusResponse> {
  const res = await fetch("/api/user/nin-payment/status");
  if (!res.ok) {
    throw new Error(`Failed to fetch NIN payment status (${res.status})`);
  }
  return res.json();
}

export const useNinStatus = (user: User | null) => {
  const userId = user?.id;
  const isVerified = user?.ninStatus === "verified";

  const { data, isLoading, error } = useQuery({
    queryKey: ninStatusQueryKey(userId),
    queryFn: fetchNinStatus,
    enabled: !!userId && !isVerified,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Derive status from query data — single source of truth, no duplicated state
  const paid = isVerified || data?.paymentStatus === "success";
  const verified = isVerified || data?.ninStatus === "verified";

  return {
    paid,
    verified,
    reason: data?.message ?? "",
    ninStatus: data?.ninStatus ?? user?.ninStatus ?? "pending",
    paymentStatus: data?.paymentStatus ?? "unpaid",
    isLoading: !isVerified && isLoading,
    error: error instanceof Error ? error.message : null,
  };
};

/**
 * Returns a function that invalidates the shared NIN status cache.
 * Call this after payment or NIN verification succeeds so all
 * consumers (layout, verify page) pick up the new state.
 */
export function useInvalidateNinStatus() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ["nin-status"] });
}

export default useNinStatus;
