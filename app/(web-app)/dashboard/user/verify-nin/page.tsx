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

export default function VerifyNin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const isInitialized = useRef(false);

  const [loading, setLoading] = useState(true);
  const [verifyNin, setVerifyNin] = useState(false);
  const [verifying, setVerifying] = useState(false);
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
  const [nin, setNin] = useState(user?.nin || "");

  const verifyPayment = async (
    reference: string | number,
    provider: "paystack" | "flutterwave",
  ) => {
    try {
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
        return;
      }

      setVerifyNin(true);
      showToast(
        "success",
        verifyData.message || "Payment verified successfully",
      );
      setFlutterwaveModalOpen(false);
    } catch (error) {
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

      setVerifyNin(false);
      showToast("success", "NIN verified successfully. Redirecting");
      router.push("/dashboard/user");
    } catch (error) {
      showToast("error", "Failed to verify NIN");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    const reference =
      searchParams.get("transaction_id") ||
      searchParams.get("tx_ref") ||
      searchParams.get("trxref");

    if (reference) {
      void verifyPayment(reference, paymentProvider);
      return;
    }
  }, [searchParams]);

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

      setLoading(false);

      if (!res.ok) {
        showToast(
          "error",
          data.message || data.error || "Unable to start payment",
        );
        router.push("/dashboard/user");
        return;
      }

      if (data.payment_status === "success") {
        showToast("success", data.message);
        setVerifyNin(true);
        return;
      }

      if (data.provider === "flutterwave") {
        const publicKey = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY;
        setFlutterwaveConfig({
          public_key: publicKey || "",
          tx_ref: data.reference,
          amount: Number(data.amount),
          currency: data.currency || "NGN",
          payment_options: data.meta?.payment_options || "card,banktransfer",
          customer: data.meta?.customer,
        });
        setFlutterwaveModalOpen(true);
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

  useEffect(() => {
    if (isInitialized.current) return;

    isInitialized.current = true;
    if (user?.ninStatus === "verified") return;

    // Returning from a payment redirect — the reference effect handles it.
    const hasPaymentReference =
      searchParams.get("transaction_id") ||
      searchParams.get("tx_ref") ||
      searchParams.get("trxref");

    if (hasPaymentReference) return;

    // Already accepted on the dashboard modal — go straight to payment.
    if (sessionStorage.getItem(NIN_POLICY_CONSENT_KEY) === "true") {
      sessionStorage.removeItem(NIN_POLICY_CONSENT_KEY);
      void startPayment();
      return;
    }

    // Nothing is charged until the user accepts the no refund policy.
    setLoading(false);
    setShowPolicy(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        router.back();
      },
    });
    setFlutterwaveModalOpen(false);
  }, [flutterwaveConfig, flutterwaveModalOpen, handleFlutterwavePayment]);

  return (
    <section className="-ml-6">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-auto grid">
            <div className="grid w-max grid-flow-col gap-2 font-bold text-white">
              <h1 className="text-xl sm:text-2xl md:text-7xl">PVC WAKA</h1>
            </div>

            <p className="mt-6 animate-ping text-center text-xl text-white">
              Opening payment...
            </p>
          </div>
        </div>
      )}

      {showPolicy && (
        <Modal
          isOpen
          position="absolute"
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
              className="rounded border border-green-700 bg-primary px-4 py-2 font-bold text-white disabled:opacity-60 md:px-6 md:py-2 md:text-lg"
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
