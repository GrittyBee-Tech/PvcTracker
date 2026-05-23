import React, { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  position?: "fixed" | "absolute";
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  actions?: ReactNode;
  closeButton?: boolean;
  className?: string;
}

export default function Modal({
  isOpen,
  position = "fixed",
  title,
  children,
  onClose,
  actions,
  closeButton = true,
  className = "",
}: ModalProps) {
  if (!isOpen) return null;

  const wrapperClass =
    position === "absolute" ? "absolute inset-0" : "fixed inset-0";

  return (
    <div className={`${wrapperClass} z-50`}>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={`bg-[#10200e] border border-green-900/30 rounded-lg shadow-2xl max-w-lg w-full ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-green-900/30">
              <h2 className="text-xl font-heading font-semibold text-white">
                {title}
              </h2>
              {closeButton && (
                <button
                  onClick={onClose}
                  className="p-1 text-green-100/70 hover:text-white transition-colors rounded-full hover:bg-green-900/20"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4 text-green-100">{children}</div>

          {/* Footer / Actions */}
          {actions && (
            <div className="px-6 py-4 border-t border-green-900/30 flex items-center justify-end gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
