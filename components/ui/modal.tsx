import React, { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  position?: "fixed" | "absolute";
  containerClassName?: string;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  actions?: ReactNode;
  closeButton?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  bg?: string;
}

export default function Modal({
  isOpen,
  position = "fixed",
  containerClassName,
  title,
  children,
  onClose,
  actions,
  closeButton = true,
  className = "",
  size = "md",
  bg = "bg-white",
}: ModalProps) {
  if (!isOpen) return null;

  const wrapperClass =
    containerClassName ||
    (position === "absolute" ? "absolute inset-0 z-20" : "fixed inset-0 z-20");

  const sizeClasses = {
    sm: "w-full sm:max-w-sm",
    md: "w-full sm:max-w-md",
    lg: "w-full sm:max-w-lg",
    xl: "w-full sm:max-w-xl",
  };

  return (
    <div className={`${wrapperClass} mb-0`}>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="absolute my-3 inset-0 flex items-center justify-center md:p-4 p-6 overflow-y-auto">
        <div
          className={`
            ${bg}
            ${sizeClasses[size]}
            w-full
            border border-green-900/30
            rounded-lg
            shadow-2xl
            ${className}
            max-h-[90vh] overflow-y-auto
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-green-900/30">
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
          <div className="p-4 sm:px-6 sm:py-4 text-primary">{children}</div>

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
