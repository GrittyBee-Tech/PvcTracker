"use client";

import Modal from "@/components/ui/modal";
import { showToast } from "@/utils/constants/toast";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const VerifyNinComponent = ({ isOpen }: { isOpen: boolean }) => {
  const [verifying, setVerifying] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const [nin, setNin] = useState(user?.nin || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  const verifyNinNumber = async (nin: string) => {
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
          ...(firstName !== user?.firstName ? { firstName } : {}),
          ...(lastName !== user?.lastName ? { lastName } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast("error", data.message || "Verification failed", 5000);
        return;
      }

      showToast("success", "NIN verified successfully. Redirecting");
      router.push("/dashboard/user");
    } catch (error) {
      console.error("Error verifying NIN:", error);
      showToast("error", "Failed to verify NIN");
    } finally {
      setVerifying(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      containerClassName="fixed top-16 right-0 bottom-0 left-0 md:left-60 z-20"
      title="Verify Your Information"
      closeButton={false}
      actions={
        <button
          onClick={() => verifyNinNumber(nin)}
          disabled={verifying}
          className="rounded border cursor-pointer border-green-700 bg-primary px-4 py-2 font-bold text-white disabled:opacity-60 md:px-6 md:py-2 md:text-lg"
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
          <p>
            Please confirm your information before verifying. It will be
            confirmed with the NIN info
          </p>
        </div>

        <div className="space-y-2">
          <label className="font-medium">Confirm your First Name</label>

          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value.trim())}
            placeholder="Confirm your first name"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label className="font-medium">Confirm your Last Name</label>

          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value.trim())}
            placeholder="Confirm your last name"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label className="font-medium">National Identification Number</label>

          <input
            type="text"
            value={nin}
            maxLength={11}
            onChange={(e) => setNin(e.target.value.trim())}
            placeholder="Enter your 11-digit NIN"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2"
          />
        </div>

        <p className="text-sm text-gray-500">
          Make sure the NIN matches your official NIN record.
        </p>
      </div>
    </Modal>
  );
};

export default VerifyNinComponent;
