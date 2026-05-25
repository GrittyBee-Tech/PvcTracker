import React, { ReactNode } from "react";
import { X } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  position?: "fixed" | "absolute";
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  actions?: ReactNode;
  closeButton?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  bg?: string;
}

export default function ReportModal({
  isOpen,
  position = "fixed",
  title,
  children,
  onClose,
  actions,
  closeButton = true,
  className = "",
  size = "md",
  bg = "bg-white",
}: ReportModalProps) {
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
      <div className="absolute inset-0 flex justify-center overflow-y-auto md:p-16 ">
        <div
          className={`
            ${bg}
     
            w-9/12
            border border-green-900/30
            rounded-lg
            shadow-2xl
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-green-900/30">
              <h2 className="text-xl font-heading font-semibold text-primary">
                {title}
              </h2>

              {closeButton && (
                <button
                  onClick={onClose}
                  className="p-1 text-primary hover:text-white transition-colors rounded-full hover:bg-green-900/20"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4 text-primary">{children}</div>

          {/* Footer */}
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
