"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InputGroup from "@/components/ui/InputGroup";
import { SpinnerLoader } from "@/components/ui/Loader";
import Modal from "@/components/ui/modal";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  showModal = true,
  modalTitle = "Verify Your Information",
  modalContent = "To complete your profile setup kindly verify your NIN",
  onModalClose,
  children,
}: {
  showModal?: boolean;
  modalTitle?: string;
  modalContent?: React.ReactNode;
  onModalClose?: () => void;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(showModal);
  const [nin, setNin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [ninError, setNinError] = useState<string | null>(null);
  // const isBlocked = user?.ninStatus !== "verified";

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace("/auth/login");
    } else {
      const destination =
        user?.role === "volunteer"
          ? "/dashboard/volunteer"
          : user?.role === "admin"
            ? "/dashboard/admin"
            : "/dashboard/user";

      router.replace(destination);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setIsModalOpen(showModal);
  }, [showModal]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onModalClose?.();
  };

  useEffect(() => {
    if (!user) return;

    // open modal if NIN not verified
    if (user.ninStatus !== "verified") {
      setIsModalOpen(true);
    }
  }, [user]);

  return (
    <>
      <DashboardLayout links={links} role="User" children={children} />
      {/* Modal Overlay - NIN verification with fixed position excluding sidebar */}
      {isModalOpen && (
        <div className="fixed top-0 right-0 bottom-0 z-50 left-12 md:left-64">
          <Modal
            isOpen={isModalOpen}
            position="absolute"
            title={modalTitle}
            onClose={handleCloseModal}
            closeButton={false}
            actions={
              <>
                <button
                  onClick={handleCloseModal}
                  className="md:px-6 md:py-2 py-2  px-4 md:text-lg font-bold rounded bg-primary border border-green-700 text-white disabled:opacity-60"
                >
                  Close
                </button>
                <button
                  // onClick={handleVerify}
                  disabled={isVerifying}
                  className="md:px-6 md:py-2 py-2  px-4 md:text-lg font-bold rounded bg-primary border border-green-700 text-white disabled:opacity-60"
                >
                  {isVerifying ? (
                    <SpinnerLoader text="Processing..." />
                  ) : (
                    "Verify"
                  )}
                </button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="font-bold">
                Hello, {user?.lastName} {user?.firstName}
              </p>
              <p className="text-primary">{modalContent}</p>
              <div className="rounded-lg border border-yellow-400/30 bg-yellow-50 p-4 text-sm text-yellow-900">
                <p className="font-semibold">Verification Fee</p>
                <p>₦150 will be charged for this NIN verification request.</p>
              </div>
              <p className="text-primary font-dm-sans -mt-3">
                Please enter your NIN and continue to pay the verification fee.
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
        </div>
      )}
    </>
  );
}
