import React from "react";
import Modal from "./Modal";
import { AlertTriangle, AlertCircle, Info, RefreshCw } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  details,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger", // danger, warning, primary
  loading = false,
}) {
  const Icon = variant === "danger" ? AlertCircle : variant === "warning" ? AlertTriangle : Info;

  const footer = (
    <div className="admin-confirm-actions">
      <button
        type="button"
        className="admin-btn admin-btn-ghost"
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </button>
      <button
        type="button"
        className={`admin-btn ${
          variant === "danger"
            ? "admin-btn-danger"
            : variant === "warning"
            ? "admin-btn-warning"
            : "admin-btn-primary"
        }`}
        onClick={onConfirm}
        disabled={loading}
      >
        {loading && <RefreshCw size={15} className="spin-animate mr-2" />}
        {confirmText}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title=""
      size="sm"
      footer={footer}
      closeOnBackdrop={!loading}
    >
      <div className="admin-confirm-body">
        <div className={`admin-confirm-icon-wrap icon-${variant}`}>
          <Icon size={28} />
        </div>
        <h4 className="admin-confirm-title">{title}</h4>
        <p className="admin-confirm-message">{message}</p>
        {details && <div className="admin-confirm-details">{details}</div>}
      </div>
    </Modal>
  );
}
