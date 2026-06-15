import Logo from "../ui/Logo";

import Modal from "../ui/modal";
import InputGroup from "../ui/InputGroup";
import { UserCircle, Bell, Search } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";

export default function UserDashboard({
  showModal = true,
  modalTitle = "Verify Your Information",
  modalContent = "Please complete your profile setup before continuing.",
  verifyEndpoint = "/api/verify-nin",
  onModalClose,
}: {
  children: ReactNode;
  showModal?: boolean;
  modalTitle?: string;
  modalContent?: ReactNode;
  verifyEndpoint?: string;
  onModalClose?: () => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(showModal);
  const [nin, setNin] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [verified, setVerified] = useState(false);

  const handleCloseModal = () => {
    // Prevent closing if not verified to keep the modal blocking.
    if (!verified) return;
    setIsModalOpen(false);
    onModalClose?.();
  };

  const verifyNin = async () => {
    setErrorMsg("");
    if (nin.length !== 11) {
      setErrorMsg("NIN must be exactly 11 digits");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(verifyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nin }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Verification failed");
      }

      const data = await res.json().catch(() => ({}));
      // Assume external API returns { verified: true } on success
      if (data?.verified) {
        setStatus("success");
        setVerified(true);
        // allow closing now
        setIsModalOpen(false);
        onModalClose?.();
      } else {
        setStatus("error");
        setErrorMsg(data?.message || "NIN could not be verified");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Verification failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#10200e] border-r border-green-900/30 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-green-900/30">
          <div className="sm:mx-auto w-fit">
            <Logo />
          </div>
        </div>
        <div className="flex-1 py-6 px-4">
          <div className="text-xs border-border border-b  font-semibold text-green-100/40 uppercase tracking-wider mb-4 px-4">
            Menu
          </div>
        </div>

        <div className="p-4 border-t border-green-900/30 text-xs text-green-600/60 flex items-center justify-between">
          <span>User Portal</span>
          <span>v1.0</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-green-900/30 bg-[#10200e]/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center text-green-100/50">
            {/* Future Breadcrumbs or Search */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-green-100/40" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-[#152b12] border border-green-900/50 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-green-500/50 text-green-100 placeholder:text-green-100/30 w-64 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-green-100/70 hover:text-white transition-colors rounded-full hover:bg-green-900/20">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-green-900/50 mx-2"></div>
            <button className="flex items-center gap-2 p-1.5 pr-3 text-green-100/70 hover:text-white transition-colors rounded-full hover:bg-green-900/20 border border-transparent hover:border-green-900/30">
              <UserCircle className="w-7 h-7 text-green-400" />
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium leading-none">
                  Normal User
                </span>
                <span className="text-[10px] text-green-100/40 mt-1">User</span>
              </div>
            </button>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="relative flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">just a test</div>

          <Modal
            position="absolute"
            isOpen={isModalOpen}
            title={modalTitle}
            onClose={handleCloseModal}
            closeButton={false}
          >
            <div className="space-y-4">
              <p className="text-sm text-green-100">{modalContent}</p>

              {errorMsg && (
                <div className="p-3 bg-red-600/20 text-red-300 rounded-lg text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              <InputGroup
                label="National Identification Number (NIN)"
                name="nin"
                placeholder="Enter your 11-digit NIN"
                value={nin}
                onChange={(_, v) => setNin(v)}
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={verifyNin}
                  disabled={status === "loading"}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-60"
                >
                  {status === "loading" ? "Verifying..." : "Verify NIN"}
                </button>
              </div>
            </div>
          </Modal>
        </main>
      </div>
    </div>
  );
}
