import React from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/FormInput";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

/**
 * ConfirmDialog Component - Confirmation modal for destructive actions
 */
export function ConfirmDialog({
  isOpen = false,
  title = "Confirm Action",
  message = "Are you sure?",
  onConfirm = () => {},
  onCancel = () => {},
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "warning",
  loading = false,
}) {
  const iconVariants = {
    warning: { icon: AlertCircle, color: "text-yellow-600" },
    success: { icon: CheckCircle, color: "text-green-600" },
    danger: { icon: XCircle, color: "text-red-600" },
  };

  const Icon = iconVariants[variant]?.icon;
  const iconColor = iconVariants[variant]?.color;

  const buttonVariants = {
    warning: "warning",
    success: "success",
    danger: "danger",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <div className="flex gap-4">
        {Icon && <Icon className={`h-8 w-8 flex-shrink-0 ${iconColor}`} />}
        <div className="flex-1">
          <p className="text-gray-700 mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              size="md"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={buttonVariants[variant]}
              size="md"
              onClick={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
