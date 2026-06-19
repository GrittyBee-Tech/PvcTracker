"use client";

import { useEffect, useRef, useState } from "react";
import PaystackPop from "@paystack/inline-js";
import { useRouter } from "next/navigation";
import { IoFootstepsSharp } from "react-icons/io5";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/utils/constants/toast";
import Modal from "@/components/ui/modal";

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
    <section>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="grid mx-auto">
            <div className="grid grid-flow-col gap-2 text-white w-max text-pretty font-bold">
              <h1 className="text-xl sm:text-2xl md:text-7xl">PVC WAKA</h1>
              <IoFootstepsSharp className="text-xl sm:text-2xl md:text-3xl" />
            </div>
            <p className="text-xl text-center animate-ping text-white mt-6">
              Opening payment...
            </p>
          </div>
        </div>
      )}
      <Modal
        isOpen={true}
        position="absolute"
        title="Verify Your Information"
        closeButton={false}
        actions={
          <>
            <button className="md:px-6 md:py-2 py-2  px-4 md:text-lg font-bold rounded bg-primary border border-green-700 text-white disabled:opacity-60">
              Verify nin
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="font-bold">You are Almost there {user?.firstName}</p>
          <p className="text-primary">
            To complete your profile setup kindly verify your NIN
          </p>
          <div className="rounded-lg border border-yellow-400/30 bg-yellow-50 p-4 text-sm text-yellow-900">
            <p className="font-semibold">Verification Fee has been Paid</p>
            <p> Payment was Successful</p>
          </div>
          <p className="text-primary font-dm-sans -mt-3">
            Kindly confirm your NIN.
          </p>

          <p className="text-xs font-dm-sans text-muted-foreground"></p>
        </div>
      </Modal>
    </section>
  );
}
