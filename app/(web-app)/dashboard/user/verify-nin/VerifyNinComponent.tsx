"use client";

import Modal from "@/components/ui/modal";
import { showToast } from "@/utils/constants/toast";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useInvalidateNinStatus } from "@/hooks/useNinStatus";
import Swal from "sweetalert2";

const VerifyNinComponent = ({ isOpen }: { isOpen: boolean }) => {
  const [verifying, setVerifying] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const invalidateNinStatus = useInvalidateNinStatus();
  const [nin, setNin] = useState(user?.nin || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  const handleVerifyClick = async () => {
    const trimmedNin = nin.trim();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedNin) {
      showToast("error", "Please enter your NIN");
      return;
    }

    if (!trimmedFirst || !trimmedLast) {
      showToast("error", "First name and last name are required");
      return;
    }

    // Confirmation dialog before consuming verification attempt
    const confirmResult = await Swal.fire({
      title: "Confirm Your Information",
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.5;">
          <p style="margin-bottom: 12px; color: #374151;">
            Please ensure the details below match your official NIMC NIN slip exactly:
          </p>
          <div style="background-color: #f3f4f6; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; margin-bottom: 12px;">
            <div style="margin-bottom: 4px;"><strong style="color: #4b5563;">First Name:</strong> <span style="color: #111827; font-weight: 600;">${trimmedFirst}</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #4b5563;">Last Name:</strong> <span style="color: #111827; font-weight: 600;">${trimmedLast}</span></div>
            <div><strong style="color: #4b5563;">NIN:</strong> <span style="color: #111827; font-weight: 600;">${trimmedNin}</span></div>
          </div>
          <p style="color: #dc2626; font-size: 12px; font-weight: 600;">
            ⚠️ If any information does not match your official NIN record, this verification will fail and you will need to pay again to retry.
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Confirm & Verify",
      cancelButtonText: "Review Details",
      confirmButtonColor: "#059669",
      cancelButtonColor: "#6b7280",
    });

    if (confirmResult.isConfirmed) {
      await verifyNinNumber(trimmedNin, trimmedFirst, trimmedLast);
    }
  };

  const verifyNinNumber = async (
    trimmedNin: string,
    trimmedFirst: string,
    trimmedLast: string,
  ) => {
    try {
      setVerifying(true);

      const res = await fetch("/api/user/verify-nin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nin: trimmedNin,
          firstName: trimmedFirst,
          lastName: trimmedLast,
        }),
      });

      const data = await res.json();

      // System error (provider 5xx / timeout): credit NOT consumed
      if (res.status === 503 || data.systemError) {
        await Swal.fire({
          icon: "info",
          title: "Service Temporarily Busy",
          text:
            data.message ||
            "The identity verification service is temporarily unavailable. Your payment has NOT been lost. Please try again shortly.",
          confirmButtonColor: "#059669",
        });
        return;
      }

      // Verification failure (mismatch / invalid NIN): credit consumed
      if (!res.ok || !data.success) {
        await Swal.fire({
          icon: "error",
          title: "Verification Unsuccessful",
          text:
            data.message ||
            "Your profile information does not match your official NIN record. Please pay and verify again.",
          confirmButtonText: "I Understand",
          confirmButtonColor: "#dc2626",
        });

        await invalidateNinStatus();
        return;
      }

      showToast("success", "NIN verified successfully. Redirecting");
      await invalidateNinStatus();
      router.push("/dashboard/user");
    } catch (error) {
      console.error("Error verifying NIN:", error);
      showToast(
        "error",
        "Network error. Please check your connection and retry.",
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      containerClassName="fixed top-16 right-0 bottom-0 left-0 md:left-60 z-20"
      title="Verification Payment Successful"
      closeButton={false}
      actions={
        <button
          onClick={handleVerifyClick}
          disabled={verifying}
          className="rounded border cursor-pointer border-green-700 bg-primary px-4 py-2 font-bold text-white disabled:opacity-60 md:px-6 md:py-2 md:text-lg"
        >
          {verifying ? "Verifying..." : "Verify NIN"}
        </button>
      }
    >
      <div className="space-y-4">
        <p className="font-bold">You are almost there, {user?.firstName}</p>

        {/* Prominent warning about consumable payment */}
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 space-y-1.5">
          <p className="font-bold flex items-center gap-1.5 text-amber-950">
            <span>⚠️</span> Important Verification Notice
          </p>
          <p>
            Please confirm that your <strong>First Name</strong>,{" "}
            <strong>Last Name</strong>, and <strong>NIN</strong> match your
            official NIMC NIN slip exactly.
          </p>
          <p className="font-semibold text-amber-800 text-xs">
            If verification fails due to mismatched information or an invalid
            NIN, you will need to pay again to retry.
          </p>
        </div>

        <div className="space-y-2">
          <label className="font-medium text-sm text-gray-700">
            Confirm your First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Confirm your first name"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-2">
          <label className="font-medium text-sm text-gray-700">
            Confirm your Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Confirm your last name"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-2">
          <label className="font-medium text-sm text-gray-700">
            National Identification Number
          </label>
          <input
            type="text"
            value={nin}
            onChange={(e) => setNin(e.target.value.trim())}
            placeholder="Enter your 11-digit NIN"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <p className="text-xs text-gray-500">
          Double-check your 11-digit NIN and name spelling before clicking
          Verify.
        </p>
      </div>
    </Modal>
  );
};

export default VerifyNinComponent;
