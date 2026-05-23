"use client";

import Modal from "@/components/ui/modal";
import React, { ReactNode, useEffect, useState } from "react";
import InputGroup from "@/components/ui/InputGroup";
import { SpinnerLoader } from "@/components/ui/Loader";

export default function TestModal({
  children,
  position = "absolute",
  showModal = true,
  modalTitle = "Verify Your NIN ",
  modalContent = "Please verify your NIN to complete your profile setup before continuing.",
  verifyEndpoint = "/api/verify-nin",

  onModalClose,
}: {
  children: ReactNode;
  position: string;
  showModal?: boolean;
  modalTitle?: string;
  modalContent?: ReactNode;
  verifyEndpoint?: string;
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
    try {
      await new Promise((res) => setTimeout(res, 800));
      // Mock verification logic: numeric length >=9 => verified
      const digits = nin.replace(/\D/g, "");
      const verified = digits.length >= 9;
      // show a simple alert for demo
      if (verified) alert("NIN verified (mock)");
      else alert("NIN verification failed (mock)");
    } finally {
      setIsVerifying(false);
      setIsModalOpen(false);
    }
  };
  return (
    <div className="relative w-full h-screen overflow-auto bg-gray-50">
      {/* Demo content area (simulating dashboard sidebar + content) */}
      <div className="flex h-full">
        {/* Sidebar (demo) */}
        <div className="w-64 bg-[#10200e] text-white p-4 border-r border-green-900/30">
          <h3 className="font-semibold mb-4">Dashboard Sidebar</h3>
          <nav className="space-y-2">
            <div className="p-2 rounded bg-green-900/20">Profile</div>
            <div className="p-2 rounded">Settings</div>
            <div className="p-2 rounded">History</div>
          </nav>
        </div>

        {/* Content area (modal should cover only this) */}
        <div className=" relative flex-1 p-8 overflow-auto">
          <h1 className="text-3xl font-bold text-primary mb-4">
            Dashboard Content
          </h1>
          <p className="text-gray-700 mb-6">
            This is the main content area. The modal below will only cover this
            section, not the sidebar.
          </p>

          {/* Content container with relative positioning for absolute modal */}
          <div className=" bg-white rounded-lg shadow p-6 min-h-96">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Dashboard Section
            </h2>
            <p className="text-gray-600 mb-6">
              Click the button below to show the NIN verification modal. Notice
              it only covers this content area, not the sidebar.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-green-800"
            >
              Open NIN Verify Modal
            </button>

            {/* Modal positioned absolutely within this content container */}
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
                    className="px-3 py-2 rounded bg-transparent border border-green-700 text-green-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="px-3 py-2 rounded bg-primary text-white disabled:opacity-60 flex items-center gap-2"
                  >
                    {isVerifying ? (
                      <SpinnerLoader text="Verifying..." />
                    ) : (
                      "Verify NIN"
                    )}
                  </button>
                </>
              }
            >
              <div className="space-y-3">
                <p className="text-green-100">{modalContent}</p>
                <InputGroup
                  label="NIN"
                  name="nin"
                  onChange={(f, v) => setNin(v)}
                  placeholder="Enter your NIN"
                  type="text"
                  value={nin}
                />
                {ninError && <p className="text-sm text-red-400">{ninError}</p>}
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}
