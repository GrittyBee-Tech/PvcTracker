"use client";

import { useEffect, useRef, useState } from "react";
import PaystackPop from "@paystack/inline-js";
import { useRouter } from "next/navigation";
import { IoFootstepsSharp } from "react-icons/io5";

import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/utils/constants/toast";

import Modal from "@/components/ui/modal";

export default function VerifyNin() {
  const router = useRouter();
  const { user } = useAuth();

  const isInitialized = useRef(false);

  const [loading, setLoading] = useState(true);
  const [verifyNin, setVerifyNin] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [nin, setNin] = useState(user?.nin || "");

  const verifyNinNumber = async () => {
    if (!nin.trim()) {
      showToast("error", "Please enter your NIN");
      return;
    }

    try {
      setVerifying(true);

      const res = await fetch("/api/user/verify-nin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nin: nin.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast("error", data.message || "Verification failed");
        return;
      }

      showToast("success", "NIN verified successfully. Redirecting");
      setVerifyNin(false);
      router.push("/dashboard/user");
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to verify NIN");
    } finally {
      setVerifying(false);
    }
  };

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

        if (!res.ok) {
          showToast("error", data.message);
          router.push("/dashboard/user");
          return;
        }

        if (data.status === "success") {
          showToast("success", data.message);
          setVerifyNin(true);
          return;
        }

        const popup = new PaystackPop();

        popup.resumeTransaction(data.access_code, {
          onSuccess: async ({ reference }) => {
            try {
              const verifyRes = await fetch("/api/user/nin-payment/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  reference,
                }),
              });

              const verifyData = await verifyRes.json();

              if (!verifyRes.ok) {
                showToast(
                  "error",
                  verifyData.message || "Payment verification failed",
                );
                return;
              }

              showToast(
                "success",
                verifyData.message || "Payment verified successfully",
              );

              setVerifyNin(true);
            } catch (error) {
              console.error(error);
              showToast("error", "Unable to verify payment");
            }
          },

          onCancel: () => {
            router.push("/dashboard/user");
          },
        });
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          showToast("error", error.message);
        } else {
          showToast("error", "Something went wrong");
        }

        setLoading(false);
      }
    };

    startPayment();
  }, [router]);

  return (
    <section className="-ml-6">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="grid mx-auto">
            <div className="grid grid-flow-col gap-2 text-white w-max font-bold">
              <h1 className="text-xl sm:text-2xl md:text-7xl">PVC WAKA</h1>

              <IoFootstepsSharp className="text-xl sm:text-2xl md:text-3xl" />
            </div>

            <p className="text-xl text-center animate-ping text-white mt-6">
              Opening payment...
            </p>
          </div>
        </div>
      )}

      {verifyNin && (
        <Modal
          isOpen
          position="absolute"
          title="Verify Your Information"
          closeButton={false}
          actions={
            <button
              onClick={verifyNinNumber}
              disabled={verifying}
              className="md:px-6 md:py-2 py-2 px-4 md:text-lg font-bold rounded bg-primary border border-green-700 text-white disabled:opacity-60"
            >
              {verifying ? "Verifying..." : "Verify NIN"}
            </button>
          }
        >
          <div className="space-y-4">
            <p className="font-bold">You are almost there {user?.firstName}</p>

            <p className="text-primary">
              To complete your profile setup kindly verify your NIN.
            </p>

            <div className="rounded-lg border border-yellow-400/30 bg-yellow-50 p-4 text-sm text-yellow-900">
              <p className="font-semibold">Verification Fee has been Paid</p>
              <p>Payment was Successful</p>
            </div>

            <div className="space-y-2">
              <label className="font-medium">
                National Identification Number
              </label>

              <input
                type="text"
                value={nin}
                maxLength={11}
                onChange={(e) => setNin(e.target.value)}
                placeholder="Enter your 11-digit NIN"
                className="w-full rounded-lg border p-3 outline-none focus:ring-2"
              />
            </div>

            <p className="text-sm text-gray-500">
              Make sure the NIN matches your official NIN record.
            </p>
          </div>
        </Modal>
      )}
    </section>
  );
}
