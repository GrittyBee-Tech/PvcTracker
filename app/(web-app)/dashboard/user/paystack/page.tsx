"use client";

import { useEffect, useState } from "react";
import PaystackPop from "@paystack/inline-js";
import { useRouter, useSearchParams } from "next/navigation";
import { IoFootstepsSharp } from "react-icons/io5";

export default function PayStack() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const startPayment = async () => {
      try {
        const nin = searchParams.get("nin");

        if (!nin) {
          router.push("/dashboard/user");
          return;
        }
        const res = await fetch("/api/user/nin-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nin }),
        });

        const data = await res.json();

        const popup = new PaystackPop();

        popup.resumeTransaction(data.access_code, {
          onSuccess: () => {
            router.push("/payment/success");
          },
          onCancel: () => {
            router.push("/dashboard/user?reopenModal=1");
          },
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    startPayment();
  }, [router, searchParams]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {loading && (
        <div className="grid mx-auto">
          <div className="grid grid-flow-col gap-2 text-white animate-ping w-max text-pretty font-bold">
            <h1 className="text-xl sm:text-2xl md:text-4xl">PVC WAKA</h1>
            <IoFootstepsSharp className="text-xl sm:text-2xl md:text-3xl" />
          </div>
          <p className="text-xl text-white mt-6">Opening payment...</p>
        </div>
      )}
    </div>
  );
}
