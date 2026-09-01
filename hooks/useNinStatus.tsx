import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "better-auth";
import { showToast } from "@/utils/constants/toast";

export interface NinStatus {
  paid: boolean;
  verified: boolean;
  reason: string;
  ninStatus: string;
  paymentStatus: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

type UserWithNinStatus = (User & { ninStatus?: string }) | null;

export const useNinStatus = (user: UserWithNinStatus) => {
  const userId = user?.id;
  const initialNinStatus = user?.ninStatus;

  const [ninStatus, setNinStatus] = useState<Omit<NinStatus, "refetch">>({
    paid: false,
    verified: initialNinStatus === "verified",
    reason: "",
    ninStatus: initialNinStatus || "pending",
    paymentStatus: "unpaid",
    isLoading: Boolean(userId),
    error: null,
  });

  const hasFetchedRef = useRef(false);

  const checkPaymentStatus = useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) {
        setNinStatus((prev) => ({
          ...prev,
          isLoading: false,
          verified: false,
          paid: false,
          reason: "",
          ninStatus: "pending",
          paymentStatus: "unpaid",
        }));
        return;
      }

      try {
        // Only set isLoading to true on the very first fetch to avoid UI flashing during background revalidations
        if (!hasFetchedRef.current) {
          setNinStatus((prev) => ({ ...prev, isLoading: true, error: null }));
        }

        const res = await fetch("/api/user/nin-payment/status", {
          method: "GET",
          signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch NIN payment status (${res.status})`);
        }

        const data = await res.json();
        hasFetchedRef.current = true;

        const resolvedPaymentStatus = data.paymentStatus || "unpaid";

        setNinStatus({
          paid: resolvedPaymentStatus === "success",
          verified: data.ninStatus === "verified",
          reason: data.message || "",
          ninStatus: data.ninStatus || initialNinStatus || "pending",
          paymentStatus: resolvedPaymentStatus,
          isLoading: false,
          error: null,
        });
        showToast(
          data.ninStatus === "rejected" ? "error" : "info",
          data.message || "NIN verification status updated",
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setNinStatus((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to check status",
        }));
      }
    },
    [userId, initialNinStatus],
  );

  useEffect(() => {
    const controller = new AbortController();
    checkPaymentStatus(controller.signal);

    return () => {
      controller.abort();
    };
  }, [checkPaymentStatus]);

  return {
    ...ninStatus,
    refetch: checkPaymentStatus,
  };
};

export default useNinStatus;
