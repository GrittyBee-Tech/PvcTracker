"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InputGroup from "@/components/ui/InputGroup";
import Modal from "@/components/ui/modal";
import NoRefundPolicy, {
  NIN_POLICY_CONSENT_KEY,
} from "@/components/ui/NoRefundPolicy";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { showToast } from "@/utils/constants/toast";
import VerifyNinComponent from "./verify-nin/VerifyNinComponent";
import useNinStatus from "@/hooks/useNinStatus";

const links = [
  { href: "/dashboard/user", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/user/edit-profile", label: "Edit Profile", icon: "User" },
  { href: "/dashboard/user/find-centre", label: "Find Centre", icon: "MapPin" },
  {
    href: "/dashboard/user/become-volunteer",
    label: "Volunteer",
    icon: "HandHeart",
  },
  {
    href: "/dashboard/user/report-issues",
    label: "Report Issue",
    icon: "AlertTriangle",
  },
  {
    href: "/dashboard/user/partner",
    label: "Partnership",
    icon: "Handshake",
  },
];

const NO_NIN_MODAL_ROUTES = [
  "/dashboard/user/verify-nin",
  "/dashboard/user/report-issues",
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [nin, setNin] = useState(user?.nin || "");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const { paid, verified, isLoading } = useNinStatus(user);
  const router = useRouter();
  const pathname = usePathname();

  const handleVerify = () => {
    if (!nin.trim()) {
      showToast("error", "Please enter your NIN");
      return;
    }
    if (!agreedToPolicy) {
      showToast("error", "Please accept the no refund policy to continue");
      return;
    }
    // Consumed by the verify-nin page so the policy is not shown twice.
    sessionStorage.setItem(NIN_POLICY_CONSENT_KEY, "true");
    router.push(`/dashboard/user/verify-nin`);
  };

  return (
    <>
      <DashboardLayout links={links} role="User">
        {children}
        {/* Modal Overlay - NIN verification */}
        <VerifyNinComponent
          isOpen={!verified && paid && !NO_NIN_MODAL_ROUTES.includes(pathname)}
        />
        {!isLoading &&
          !verified &&
          !paid &&
          !NO_NIN_MODAL_ROUTES.includes(pathname) && (
            <Modal
              isOpen={!verified}
              containerClassName="fixed top-16 pt-4 right-0 bottom-0 left-0 md:left-60 z-20"
              title="Verify Your Information"
              closeButton={false}
              actions={
                <>
                  <button
                    className="md:px-6 md:py-2 py-2 px-4 md:text-lg font-bold rounded bg-primary border border-green-700 text-white disabled:opacity-60 cursor-pointer"
                    onClick={handleVerify}
                    disabled={!agreedToPolicy}
                  >
                    Pay and Verify
                  </button>
                </>
              }
            >
              <div className="space-y-5">
                <p className="font-bold">
                  Hello, {user?.lastName} {user?.firstName}
                </p>
                <p className="text-primary">
                  To complete your profile setup kindly verify your NIN
                </p>
                <div className="rounded-lg border border-yellow-400/30 bg-yellow-50 p-4 text-sm text-yellow-900">
                  <p className="font-semibold">Verification Fee</p>
                  <p>₦200 will be charged for this NIN verification request.</p>
                </div>
                <p className="text-primary font-dm-sans -mt-3">
                  Please enter your NIN and continue to pay the verification
                  fee.
                </p>

                <NoRefundPolicy
                  id="nin-no-refund-agreement"
                  agreed={agreedToPolicy}
                  onAgreedChange={setAgreedToPolicy}
                />
              </div>
            </Modal>
          )}
      </DashboardLayout>
    </>
  );
}
