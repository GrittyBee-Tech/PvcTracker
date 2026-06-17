"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InputGroup from "@/components/ui/InputGroup";
import { SpinnerLoader } from "@/components/ui/Loader";
import Modal from "@/components/ui/modal";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import PaystackPop from "@paystack/inline-js";
import { showToast } from "@/utils/constants/toast";

const links = [
  { href: "/dashboard/user", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/user/edit-profile", label: "Edit Profile", icon: "User" },
  { href: "/dashboard/user/find-centre", label: "Find Centre", icon: "MapPin" },
  {
    href: "/dashboard/user/become-volunteer",
    label: "Volunteer",
    icon: "HeartHandshake",
  },

  {
    href: "/dashboard/user/report-issues",
    label: "Report Issue",
    icon: "AlertTriangle",
  },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(
    user?.ninStatus !== "verified",
  );
  const [nin, setNin] = useState(user?.nin || "");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isVerifying, setIsVerifying] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ninError, setNinError] = useState<string | null>(null);
  const [isOpeningPayment, setIsOpeningPayment] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleVerify = async () => {
    setIsVerifying(true);
    setIsOpeningPayment(true);

    const res = await fetch("/api/user/nin-payment", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setIsVerifying(false);
      setIsOpeningPayment(true);
      showToast("error", "Failed to initialize NIN payment. Please try again.");
      return;
    }
    await new Promise((r) => setTimeout(r, 100));
    const popup = new PaystackPop();

    popup.resumeTransaction(data.access_code, {
      onSuccess: () => {
        setIsOpeningPayment(false);
        setIsModalOpen(false);
      },
      onCancel: () => {
        setIsOpeningPayment(false);
        setIsModalOpen(true);
      },
    });

    // close modal ONLY after Paystack has been triggered
    setIsModalOpen(false);
    setIsOpeningPayment(true);
    setIsVerifying(false);
  };
  return (
    <>
      <DashboardLayout links={links} role="User">
        {children}
        {/* Modal Overlay - NIN verification with fixed position excluding sidebar */}
        {isModalOpen && (
          <div className="fixed top-0 right-0 bottom-0 z-50 left-12 md:left-64">
            <Modal
              isOpen={isModalOpen}
              position="absolute"
              title="Verify Your Information"
              onClose={handleCloseModal}
              closeButton={false}
              actions={
                <>
                  {/* <button
                    onClick={handleCloseModal}
                    className="md:px-6 md:py-2 py-2  px-4 md:text-lg font-bold rounded bg-primary border border-green-700 text-white disabled:opacity-60"
                  >
                    Close
                  </button> */}
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="md:px-6 md:py-2 py-2  px-4 md:text-lg font-bold rounded bg-primary border border-green-700 text-white disabled:opacity-60"
                  >
                    {isVerifying ? (
                      <SpinnerLoader text="Processing..." />
                    ) : (
                      "Pay and Verify"
                    )}
                  </button>
                </>
              }
            >
              <div className="space-y-4">
                <p className="font-bold">
                  Hello, {user?.lastName} {user?.firstName}
                </p>
                <p className="text-primary">
                  To complete your profile setup kindly verify your NIN
                </p>
                <div className="rounded-lg border border-yellow-400/30 bg-yellow-50 p-4 text-sm text-yellow-900">
                  <p className="font-semibold">Verification Fee</p>
                  <p>₦150 will be charged for this NIN verification request.</p>
                </div>
                <p className="text-primary font-dm-sans -mt-3">
                  Please enter your NIN and continue to pay the verification
                  fee.
                </p>
                <InputGroup
                  label="NIN"
                  name="nin"
                  onChange={(field, value) => setNin(value)}
                  placeholder="Enter your NIN"
                  type="text"
                  value={nin}
                />
                {ninError && <p className="text-sm text-red-400">{ninError}</p>}
                <p className="text-xs font-dm-sans text-muted-foreground"></p>
              </div>
            </Modal>
            {isOpeningPayment && (
              <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
            )}
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
