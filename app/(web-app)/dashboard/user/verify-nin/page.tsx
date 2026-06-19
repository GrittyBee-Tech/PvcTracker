"use client";

import { useEffect, useState } from "react";
import PaystackPop from "@paystack/inline-js";
import { useRouter } from "next/navigation";
import { IoFootstepsSharp } from "react-icons/io5";
import { useAuth } from "@/hooks/useAuth";

export default function PayStack() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { user } = useAuth();
  const [nin, setNin] = useState(user?.nin || "");

  useEffect(() => {
    const startPayment = async () => {
      try {
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
            router.push("/dashboard/user");
          },
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    startPayment();
  }, [router]);

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
