import React from "react";
import { X } from "lucide-react";

/**
 * Modal Component
 * Flexible modal/dialog for forms, confirmations, and content display
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeButton = true,
  className = "",
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full mx-4 ${sizeClasses[size]} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {closeButton && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Sheet Component - Side panel variant of Modal
 */
export function Sheet({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  width = "w-96",
  className = "",
}) {
  if (!isOpen) return null;

  const positionClasses = {
    left: "left-0",
    right: "right-0",
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={onClose}
    >
      <div
        className={`fixed inset-y-0 ${positionClasses[position]} ${width} bg-white shadow-xl flex flex-col ${className}`}
        style={{ zIndex: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
