import React from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export default function ToastContainer({ toasts = [], onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="admin-toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let Icon = Info;
        let iconClass = "toast-icon-info";

        if (toast.type === "success") {
          Icon = CheckCircle2;
          iconClass = "toast-icon-success";
        } else if (toast.type === "error") {
          Icon = AlertCircle;
          iconClass = "toast-icon-error";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          iconClass = "toast-icon-warning";
        }

        return (
          <div key={toast.id} className={`admin-toast-item toast-${toast.type || "info"}`}>
            <span className={`toast-icon ${iconClass}`}>
              <Icon size={18} />
            </span>
            <div className="toast-content">{toast.message}</div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => onRemove && onRemove(toast.id)}
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
