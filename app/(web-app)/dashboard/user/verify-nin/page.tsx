"use client";

import { useEffect, useRef, useState } from "react";
import PaystackPop from "@paystack/inline-js";
import { useFlutterwave } from "flutterwave-react-v3";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/utils/constants/toast";

import Modal from "@/components/ui/modal";
import NoRefundPolicy, {
  NIN_POLICY_CONSENT_KEY,
} from "@/components/ui/NoRefundPolicy";
import useNinStatus, { useInvalidateNinStatus } from "@/hooks/useNinStatus";
import { SpinnerLoader } from "@/components/ui/Loader";
import VerifyNinComponent from "./VerifyNinComponent";

export default function VerifyNin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const paymentVerifiedRef = useRef(false);
  const { paid, verified, isLoading } = useNinStatus(user);
  const invalidateNinStatus = useInvalidateNinStatus();

  const [loading, setLoading] = useState(true);
  const [verifyNin, setVerifyNin] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [flutterwaveModalOpen, setFlutterwaveModalOpen] = useState(false);
  const [flutterwaveConfig, setFlutterwaveConfig] = useState<{
    public_key: string;
    tx_ref: string;
    amount: number;
    currency: string;
    payment_options: string;
    customer: {
      email: string;
      phone_number: string;
      name: string;
    };
  } | null>(null);

  const paymentProvider: "flutterwave" | "paystack" = "flutterwave";

  const verifyPayment = async (
    reference: string | number,
    provider: "paystack" | "flutterwave",
  ) => {
    try {
      setLoading(true);
      const verifyRes = await fetch("/api/user/nin-payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: String(reference),
          provider,
          txRef: flutterwaveConfig?.tx_ref || "",
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        showToast("error", verifyData.message || "Payment verification failed");
        setLoading(false);
        return;
      }

      paymentVerifiedRef.current = true;
      setLoading(false);
      setShowPolicy(false);
      setFlutterwaveModalOpen(false);
      setVerifyNin(true);
      await invalidateNinStatus();
      showToast(
        "success",
        verifyData.message || "Payment verified successfully",
        3500,
      );
    } catch (error) {
      setLoading(false);
      showToast("error", "Unable to verify payment");
    }
  };

  const handleFlutterwavePayment = useFlutterwave({
    public_key: flutterwaveConfig?.public_key || "",
    tx_ref: flutterwaveConfig?.tx_ref || "",
    amount: flutterwaveConfig?.amount || 0,
    currency: flutterwaveConfig?.currency || "NGN",
    payment_options: flutterwaveConfig?.payment_options || "card,banktransfer",
    customer: flutterwaveConfig?.customer || {
      email: user?.email || "",
      phone_number: "",
      name:
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        user?.email ||
        "",
    },
    customizations: {
      title: "PVC WAKA NIN Verification",
      description: "Complete your profile verification",
      logo: "https://res.cloudinary.com/demo/image/upload/v1693500000/pvc-waka-logo.png",
    },
  });

  const startPayment = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/user/nin-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider: paymentProvider }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        showToast(
          "error",
          data.message || data.error || "Unable to start payment",
        );
        return;
      }

      if (data.payment_status === "success") {
        showToast("success", data.message);
        paymentVerifiedRef.current = true;
        setLoading(false);
        setShowPolicy(false);
        setVerifyNin(true);
        await invalidateNinStatus();
        return;
      }

      setLoading(false);

      if (data.provider === "flutterwave") {
        setFlutterwaveModalOpen(true);
        const publicKey = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY;
        setFlutterwaveConfig({
          public_key: publicKey || "",
          tx_ref: data.reference,
          amount: Number(data.amount),
          currency: data.currency || "NGN",
          payment_options: data.meta?.payment_options || "card,banktransfer",
          customer: data.meta?.customer,
        });
        return;
      }

      const popup = new PaystackPop();

      popup.resumeTransaction(data.access_code, {
        onSuccess: async ({ reference }) => {
          await verifyPayment(reference, "paystack");
        },

        onCancel: () => {
          router.push("/dashboard/user");
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        showToast("error", error.message);
      } else {
        showToast("error", "Something went wrong");
      }

      setLoading(false);
    }
  };

  const acceptPolicyAndPay = () => {
    if (!agreedToPolicy) {
      showToast("error", "Please accept the no refund policy to continue");
      return;
    }

    setShowPolicy(false);
    void startPayment();
  };

  // Determine initial page state based on query params and status
  useEffect(() => {
    if (isLoading) return;

    if (verified) {
      router.push("/dashboard/user");
      return;
    }

    // Handle return from payment gateway redirect
    const transactionId = searchParams.get("transaction_id");
    const txRef = searchParams.get("tx_ref");
    const trxref = searchParams.get("trxref");

    if (transactionId || txRef || trxref) {
      const reference = transactionId || txRef || trxref;
      const provider = trxref ? "paystack" : "flutterwave";
      void verifyPayment(reference!, provider);
      return;
    }

    // Already accepted on the dashboard modal — go straight to payment.
    if (sessionStorage.getItem(NIN_POLICY_CONSENT_KEY) === "true") {
      sessionStorage.removeItem(NIN_POLICY_CONSENT_KEY);
      void startPayment();
      return;
    }

    // If payment was already completed, open NIN verification directly
    if (paid) {
      setLoading(false);
      setShowPolicy(false);
      setVerifyNin(true);
      return;
    }

    // Otherwise show policy modal before initiating payment
    setLoading(false);
    setShowPolicy(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paid, verified, isLoading]);

  useEffect(() => {
    if (!flutterwaveModalOpen || !flutterwaveConfig) return;

    handleFlutterwavePayment({
      callback: async (response) => {
        const transactionId = response?.transaction_id;
        if (transactionId) {
          await verifyPayment(transactionId, "flutterwave");
        }
      },
      onClose: () => {
        setLoading(false);
        setFlutterwaveModalOpen(false);
        invalidateNinStatus();
        // if (!paymentVerifiedRef.current) {
        //   void verifyPayment(flutterwaveConfig?.tx_ref, "flutterwave");
        // }
      },
    });
    setFlutterwaveModalOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flutterwaveConfig, flutterwaveModalOpen]);

  return (
    <section className="-ml-6">
      {(loading || isLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-auto grid">
            <SpinnerLoader border="border-7" size="size-20" />

            <p className="mt-6 animate-ping text-center text-xl text-white">
              Opening payment...
            </p>
          </div>
        </div>
      )}
      {showPolicy && !paid && !isLoading && !verifyNin && (
        <Modal
          isOpen
          containerClassName="fixed top-16 right-0 bottom-0 left-0 md:left-60 z-20"
          size="lg"
          title="Before You Pay"
          closeButton={false}
          actions={
            <>
              <button
                onClick={() => router.push("/dashboard/user")}
                className="rounded border border-green-900/30 px-4 py-2 font-bold text-primary md:px-6 md:py-2 md:text-lg"
              >
                Cancel
              </button>

              <button
                onClick={acceptPolicyAndPay}
                disabled={!agreedToPolicy}
                className="rounded border border-green-700 bg-primary px-4 py-2 font-bold text-white disabled:opacity-60 md:px-6 md:py-2 md:text-lg"
              >
                I Agree &amp; Continue
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="font-bold">
              Hello {user?.firstName}, please read this before we open payment.
            </p>

            <NoRefundPolicy
              agreed={agreedToPolicy}
              onAgreedChange={setAgreedToPolicy}
            />
          </div>
        </Modal>
      )}

      <VerifyNinComponent isOpen={verifyNin || (!verified && paid)} />
    </section>
  );
}
