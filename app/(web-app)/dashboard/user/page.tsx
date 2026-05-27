"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Clock, MapPin, User, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import InputGroup from "@/components/ui/InputGroup";
import { SpinnerLoader } from "@/components/ui/Loader";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/hooks/useAuth";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin" | "volunteer";
  phoneNumber?: string;
  nin?: string;
  ninVerified: boolean;
  isEmailVerified: boolean;
}

// import PaystackPop from "@paystack/inline-js";

export default function UserDashboardPage({
  showModal = true,
  modalTitle = "Verify Your Information",
  modalContent = "Please complete your profile setup before continuing.",
  onModalClose,
}: {
  showModal?: boolean;
  modalTitle?: string;
  modalContent?: React.ReactNode;
  onModalClose?: () => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(showModal);

  useEffect(() => {
    setIsModalOpen(showModal);
  }, [showModal]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onModalClose?.();
  };

  const { user } = useAuth();
  console.log

  // const paystack = new PaystackPop();
  const [nin, setNin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [ninError, setNinError] = useState<string | null>(null);

  const handleVerify = async () => {
    setNinError(null);
    if (!nin || nin.trim().length < 6) {
      setNinError("Please enter a valid NIN.");
      return;
    }
    setIsVerifying(true);
    // Mock verification flow for demo purposes
    try {
      await new Promise((res) => setTimeout(res, 1000));
      // simple mock rule: if length >= 9 consider verified
      if (nin.replace(/\D/g, "").length >= 9) {
        // update local display state (for demo only)
        user.ninStatus = "Verified";
      } else {
        user.ninStatus = "Rejected";
      }
    } finally {
      setIsVerifying(false);
      setIsModalOpen(false);
    }
  };

  const getNinStatusDisplay = (status: string) => {
    switch (status) {
      case "Verified":
        return {
          text: "Verified",
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          colorClass: "text-green-400",
          description:
            "Your National Identification Number has been successfully verified.",
        };
      case "Rejected":
        return {
          text: "Rejected",
          icon: <Clock className="w-5 h-5 text-primary" />,
          colorClass: "text-red-400",
          description:
            "Your NIN verification was rejected. Please check your profile for details.",
        };
      case "Pending Verification":
      default:
        return {
          text: "Pending Verification",
          icon: <Clock className="w-5 h-5 text-primary " />,
          colorClass: "text-yellow-400",
          description:
            "Your National Identification Number is being processed.",
        };
    }
  };

  const getPvcStatusDisplay = (status: string) => {
    switch (status) {
      case "Collected":
        return {
          text: "Collected",
          icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
          colorClass: "text-green-400",
          description:
            "You have successfully collected your Permanent Voter Card.",
        };
      case "Pending":
        return {
          text: "Pending",
          icon: <Clock className="w-5 h-5 text-primary" />,
          colorClass: "text-yellow-400",
          description: "Your PVC collection status is pending update.",
        };
      case "Not Collected":
      default:
        return {
          text: "Not Collected",
          icon: <Clock className="w-5 h-5 text-primary" />,
          colorClass: "text-red-400",
          description: "You have not yet collected your Permanent Voter Card.",
        };
    }
  };

  // const ninDisplay = getNinStatusDisplay(user.ninStatus);
  // const pvcDisplay = getPvcStatusDisplay(user.pvcStatus);

  //handle payment with paystack inline js
  // const handlePayment = () => {
  //   paystack.newTransaction({
  //     key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,

  //     email: "user@email.com",

  //     amount: 15000, // ₦150 in kobo

  //     currency: "NGN",

  //     reference: `nin_${Date.now()}`,

  //     onSuccess(transaction) {
  //       console.log(transaction);

  //       // call your backend here
  //       verifyNIN(transaction.reference);
  //     },

  //     onCancel() {
  //       console.log("Payment cancelled");
  //     },

  //     onError(error) {
  //       console.log(error);
  //     },
  //   });
  // };
  return (
    <div className="relative space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-primary">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1 font-dm-sans">
            Here's a quick overview of your PVC WAKA journey and important
            actions.
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-10">
        {/* <Card className="border-gray-400 shadow-md">
          <CardHeader className="flex flex-row  items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              NIN Verification
            </CardTitle>
            {ninDisplay.icon}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl  font-dm-sans font-bold ${ninDisplay.colorClass}`}
            >
              {ninDisplay.text}
            </div>
            <p className="text-xs font-dm-sans text-muted-foreground mt-1">
              {ninDisplay.description}
            </p>
          </CardContent>
        </Card> */}
        <Card className="border-gray-400 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-space-grotesk font-medium text-primary">
              PVC Collection
            </CardTitle>
            {/* {pvcDisplay.icon} */}
          </CardHeader>
          <CardContent>
            {/* <div className={`text-2xl font-bold ${pvcDisplay.colorClass}`}>
              {pvcDisplay.text}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pvcDisplay.description}
            </p> */}
          </CardContent>
        </Card>
        <Card className="border-gray-400 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Registered By
            </CardTitle>
            <User className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold text-primary">
              {user.registeredBy}
            </div> */}
            <p className="text-xs font-dm-sans text-muted-foreground mt-1">
              You registered yourself on the platform.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-primary">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
          <Card className="border-gray-400 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-primary">
                Find INEC Centre
              </CardTitle>
              <MapPin className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Locate the nearest registration or collection center.
              </p>
              <Link href="/dashboard/user/find-centre" passHref>
                <Button className="w-full bg-primary text-white">
                  Go to Centre Finder
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="border-gray-400 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-primary">
                Update Profile
              </CardTitle>
              <Pencil className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-8">
                Edit your personal details or PVC information.
              </p>
              <Link href="/dashboard/user/profile" passHref>
                <Button className="w-full bg-primary text-white">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Modal Overlay - NIN verification with fixed position excluding sidebar */}
      {isModalOpen && (
        <div
          className="fixed top-0 right-0 bottom-0 z-50"
          style={{ left: "16rem" }}
        >
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
                  className="px-4 py-2 rounded bg-primary border border-green-700 text-green-200"
                >
                  Close
                </button>
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="px-4 py-2 rounded bg-primary text-white disabled:opacity-60 flex items-center gap-2"
                >
                  {isVerifying ? (
                    <SpinnerLoader text="Processing..." />
                  ) : (
                    "Pay ₦50 & Verify"
                  )}
                </button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="text-primary">{modalContent}</p>
              <div className="rounded-lg border border-yellow-400/30 bg-yellow-50 p-4 text-sm text-yellow-900">
                <p className="font-semibold">Verification Fee</p>
                <p>₦50 will be charged for this NIN verification request.</p>
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
              <p className="text-xs font-dm-sans text-muted-foreground">
                This is a visual demo. Verification is mocked locally.
              </p>
            </div>
          </Modal>
        </div>
      )}

      {/* Demo trigger button */}
      {/* <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-6 inline-block bg-primary text-white px-4 py-2 rounded"
        >
          Open NIN Verify Modal
        </button>
      </div> */}
    </div>
  );
}
