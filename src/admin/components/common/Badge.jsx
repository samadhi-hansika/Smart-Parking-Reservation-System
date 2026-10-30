import React from "react";
import { Zap, Car, Bike, Accessibility, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

export default function Badge({ type, value, label, size = "md" }) {
  const normalized = String(value || label || "").toLowerCase();
  let badgeClass = "badge-default";
  let IconComponent = null;

  // Types: slot-status, reservation-status, location-status, vehicle-type
  if (type === "vehicle-type" || ["car", "ev", "bike", "disabled"].includes(normalized)) {
    if (normalized === "ev" || normalized.includes("charging")) {
      badgeClass = "badge-ev";
      IconComponent = Zap;
    } else if (normalized === "bike" || normalized.includes("motorcycle")) {
      badgeClass = "badge-bike";
      IconComponent = Bike;
    } else if (normalized === "disabled" || normalized.includes("accessible")) {
      badgeClass = "badge-disabled";
      IconComponent = Accessibility;
    } else {
      badgeClass = "badge-car";
      IconComponent = Car;
    }
  } else if (
    type === "status" ||
    type === "reservation-status" ||
    type === "slot-status" ||
    type === "location-status"
  ) {
    switch (normalized) {
      case "available":
      case "active":
      case "confirmed":
        badgeClass = "badge-success";
        IconComponent = CheckCircle;
        break;
      case "reserved":
      case "pending":
      case "in-progress":
        badgeClass = "badge-warning";
        IconComponent = Clock;
        break;
      case "completed":
        badgeClass = "badge-info";
        IconComponent = CheckCircle;
        break;
      case "cancelled":
      case "maintenance":
      case "inactive":
        badgeClass = "badge-danger";
        IconComponent = normalized === "cancelled" ? XCircle : AlertTriangle;
        break;
      case "occupied":
        badgeClass = "badge-purple";
        IconComponent = Car;
        break;
      default:
        badgeClass = "badge-default";
        break;
    }
  }

  const displayLabel = label || value || "";

  return (
    <span className={`admin-badge admin-badge-${size} ${badgeClass}`}>
      {IconComponent && <IconComponent size={size === "sm" ? 11 : 13} className="badge-icon" />}
      <span className="badge-text">{displayLabel}</span>
    </span>
  );
}
