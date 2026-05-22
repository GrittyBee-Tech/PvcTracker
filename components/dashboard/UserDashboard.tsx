import Logo from "../ui/Logo";

import Modal from "../ui/modal";
import { UserCircle, Bell, Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function UserDashboard({
  children,
  showModal = true,
  modalTitle = "Verify Your Information",
  modalContent = "Please complete your profile setup before continuing.",
  onModalClose,
}: {
  children: React.ReactNode;
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
          <div className="text-xs font-semibold text-green-100/40 uppercase tracking-wider mb-4 px-4">
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
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Modal Overlay - Outside overflow container */}
      <Modal
        isOpen={isModalOpen}
        title={modalTitle}
        onClose={handleCloseModal}
        closeButton={false}
      >
        {modalContent}
      </Modal>
    </div>
  );
}
