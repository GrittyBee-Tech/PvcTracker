"use client";

import { useEffect, useRef, useState } from "react";
import PaystackPop from "@paystack/inline-js";
import { useRouter } from "next/navigation";
import { IoFootstepsSharp } from "react-icons/io5";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/utils/constants/toast";

export default function PayStack() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { user } = useAuth();
  const [nin, setNin] = useState(user?.nin || "");
  const isInitialized = useRef(false);

  // 2. Prevent execution if the flag has already flipped to true

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const startPayment = async () => {
      try {
        const res = await fetch("/api/user/nin-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setLoading(false);

        if (data.status === "success") {
          showToast("success", data.message);
        } else if (data.status === "failed") {
          showToast("error", data.message);
        }

        const popup = new PaystackPop();

        popup.resumeTransaction(data.access_code, {
          onSuccess: async ({ reference }) => {
            const res = await fetch("/api/user/nin-payment/verify", {
              method: "POST",
              body: JSON.stringify({ reference }),
            });
            const data = await res.json();
            if (res.ok) {
              showToast("success", data.message);
            }
          },
          onCancel: () => {
            router.push("/dashboard/user");
          },
        });
      } catch (error) {
        console.error("Error verifying payment", error);
        if (error instanceof Error) {
          showToast("error", error?.message);
        }
      }
    };

    startPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {loading && (
        <div className="grid mx-auto">
          <div className="grid grid-flow-col gap-2 text-white w-max text-pretty font-bold">
            <h1 className="text-xl sm:text-2xl md:text-7xl">PVC WAKA</h1>
            <IoFootstepsSharp className="text-xl sm:text-2xl md:text-3xl" />
          </div>
          <p className="text-xl text-center animate-ping text-white mt-6">
            Opening payment...
          </p>
        </div>
      )}
    </div>
  );
}
