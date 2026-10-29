import React, { useState } from "react";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import {
  formatCurrency,
  formatDate,
  formatTime12,
  formatDateTime,
  formatDuration,
} from "../../utils/formatters";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  User,
  CreditCard,
  CheckCircle,
  XCircle,
  Check,
  RefreshCw,
  Hash,
} from "lucide-react";

export default function ReservationDetailModal({
  isOpen,
  onClose,
  reservation,
  onUpdateStatus,
  actionLoading = false,
}) {
  if (!reservation) return null;

  const status = (reservation.status || "confirmed").toLowerCase();
  const amount = Number(reservation.amount ?? reservation.totalAmount ?? 0);
  const hourlyRate = Number(reservation.hourlyRate ?? 150);

  const footer = (
    <div className="admin-reservation-modal-footer">
      <button
        type="button"
        className="admin-btn admin-btn-ghost"
        onClick={onClose}
        disabled={actionLoading}
      >
        Close
      </button>

      <div className="status-action-group">
        {status === "pending" && (
          <button
            type="button"
            className="admin-btn admin-btn-success"
            onClick={() => onUpdateStatus(reservation.id, "confirmed")}
            disabled={actionLoading}
          >
            {actionLoading ? <RefreshCw size={15} className="spin-animate mr-1" /> : <Check size={15} className="mr-1" />}
            Approve Reservation
          </button>
        )}

        {(status === "confirmed" || status === "active") && (
          <>
            <button
              type="button"
              className="admin-btn admin-btn-danger-outline"
              onClick={() => onUpdateStatus(reservation.id, "cancelled")}
              disabled={actionLoading}
            >
              {actionLoading ? <RefreshCw size={15} className="spin-animate mr-1" /> : <XCircle size={15} className="mr-1" />}
              Cancel Reservation
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => onUpdateStatus(reservation.id, "completed")}
              disabled={actionLoading}
            >
              {actionLoading ? <RefreshCw size={15} className="spin-animate mr-1" /> : <CheckCircle size={15} className="mr-1" />}
              Mark Completed
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={actionLoading ? undefined : onClose}
      title="Reservation Details"
      subtitle={`Reference ID: ${reservation.paymentReference || reservation.id}`}
      footer={footer}
      size="md"
    >
      <div className="reservation-detail-container">
        {/* Top Summary Banner */}
        <div className="res-detail-header-card">
          <div className="res-header-left">
            <span className="res-bay-badge">{reservation.slotNumber || "Bay"}</span>
            <div>
              <h4 className="res-location-heading">{reservation.locationName || "Parking Hub"}</h4>
              <p className="res-date-sub">
                <Calendar size={13} className="inline-icon" /> {formatDate(reservation.date)} •{" "}
                <Clock size={13} className="inline-icon" /> {formatTime12(reservation.startTime)} –{" "}
                {formatTime12(reservation.endTime)}
              </p>
            </div>
          </div>
          <div className="res-header-right">
            <Badge type="reservation-status" value={status} label={status.toUpperCase()} size="lg" />
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="res-detail-grid">
          {/* User Info */}
          <div className="res-detail-section">
            <h5 className="res-section-title">
              <User size={15} /> Customer Information
            </h5>
            <div className="res-info-row">
              <span className="info-label">Customer Name:</span>
              <span className="info-value font-medium">{reservation.userName || "Guest Driver"}</span>
            </div>
            <div className="res-info-row">
              <span className="info-label">Email Address:</span>
              <span className="info-value text-break">{reservation.userEmail || "—"}</span>
            </div>
            <div className="res-info-row">
              <span className="info-label">User ID:</span>
              <span className="info-value font-mono text-xs">{reservation.userId || "—"}</span>
            </div>
          </div>

          {/* Slot & Location Info */}
          <div className="res-detail-section">
            <h5 className="res-section-title">
              <MapPin size={15} /> Location & Bay
            </h5>
            <div className="res-info-row">
              <span className="info-label">Parking Location:</span>
              <span className="info-value">{reservation.locationName || "—"}</span>
            </div>
            <div className="res-info-row">
              <span className="info-label">Assigned Bay:</span>
              <span className="info-value font-bold text-primary">{reservation.slotNumber || "—"}</span>
            </div>
            <div className="res-info-row">
              <span className="info-label">Vehicle Compatibility:</span>
              <span className="info-value">
                <Badge type="vehicle-type" value={reservation.slotType || "car"} size="sm" />
              </span>
            </div>
          </div>

          {/* Timing & Duration */}
          <div className="res-detail-section">
            <h5 className="res-section-title">
              <Clock size={15} /> Timing & Schedule
            </h5>
            <div className="res-info-row">
              <span className="info-label">Reservation Date:</span>
              <span className="info-value">{formatDate(reservation.date)}</span>
            </div>
            <div className="res-info-row">
              <span className="info-label">Booking Time:</span>
              <span className="info-value">
                {formatTime12(reservation.startTime)} to {formatTime12(reservation.endTime)}
              </span>
            </div>
            <div className="res-info-row">
              <span className="info-label">Duration:</span>
              <span className="info-value">
                {formatDuration(reservation.durationHours || 1)} ({reservation.durationHours || 1} hrs)
              </span>
            </div>
          </div>

          {/* Financials & Payment */}
          <div className="res-detail-section">
            <h5 className="res-section-title">
              <CreditCard size={15} /> Billing & Payment
            </h5>
            <div className="res-info-row">
              <span className="info-label">Hourly Rate:</span>
              <span className="info-value">{formatCurrency(hourlyRate)}/hr</span>
            </div>
            <div className="res-info-row">
              <span className="info-label">Total Amount:</span>
              <span className="info-value font-bold text-emerald text-lg">
                {formatCurrency(amount)}
              </span>
            </div>
            <div className="res-info-row">
              <span className="info-label">Payment Status:</span>
              <span className="info-value">
                <span className={`payment-pill pill-${reservation.paymentStatus || "unpaid"}`}>
                  {reservation.paymentStatus || "Unpaid"}
                </span>
              </span>
            </div>
            <div className="res-info-row">
              <span className="info-label">Method / Ref:</span>
              <span className="info-value text-xs font-mono">
                {reservation.paymentMethod?.toUpperCase() || "CARD"} •{" "}
                {reservation.paymentReference || reservation.id}
              </span>
            </div>
          </div>
        </div>

        {/* Timestamps audit footer */}
        <div className="res-audit-strip">
          <span>Booked on: {formatDateTime(reservation.createdAt)}</span>
          {reservation.updatedAt && (
            <span>Last updated: {formatDateTime(reservation.updatedAt)}</span>
          )}
        </div>
      </div>
    </Modal>
  );
}
