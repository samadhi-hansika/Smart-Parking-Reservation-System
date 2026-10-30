import React, { useState, useEffect, useMemo } from "react";
import Table from "../components/common/Table";
import Badge from "../components/common/Badge";
import ReservationDetailModal from "../components/reservations/ReservationDetailModal";
import { useLocations } from "../hooks/useLocations";
import {
  subscribeReservations,
  updateReservationStatus,
} from "../services/adminService";
import { useToast } from "../hooks/useToast";
import {
  formatCurrency,
  formatDate,
  formatTime12,
  formatDuration,
  getReservationAmount,
} from "../utils/formatters";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Check,
  RefreshCw,
  AlertCircle,
  Car,
} from "lucide-react";

export default function ReservationsManagementPage() {
  const { locations } = useLocations();
  const { addToast } = useToast();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLocationId, setSelectedLocationId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal inspection state
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Subscribe to live reservations
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeReservations(
      (data) => {
        setReservations(data);
        setLoading(false);
      },
      (err) => {
        console.error("Reservations subscription error:", err);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      const matchDate = !selectedDate || res.date === selectedDate;
      const matchStatus =
        selectedStatus === "all" || (res.status || "").toLowerCase() === selectedStatus.toLowerCase();
      const matchLoc =
        selectedLocationId === "all" || res.locationId === selectedLocationId;

      const lowerSearch = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        res.userName?.toLowerCase().includes(lowerSearch) ||
        res.userEmail?.toLowerCase().includes(lowerSearch) ||
        res.slotNumber?.toLowerCase().includes(lowerSearch) ||
        res.paymentReference?.toLowerCase().includes(lowerSearch) ||
        res.id?.toLowerCase().includes(lowerSearch);

      return matchDate && matchStatus && matchLoc && matchSearch;
    });
  }, [reservations, selectedDate, selectedStatus, selectedLocationId, searchTerm]);

  // Handle status update (Approve, Complete, Cancel)
  const handleUpdateStatus = async (reservationId, newStatus) => {
    setActionLoadingId(reservationId);
    try {
      await updateReservationStatus(reservationId, newStatus);
      addToast(
        `Reservation #${reservationId.slice(0, 6)} changed to ${newStatus}. Associated bay updated.`,
        "success"
      );
      // If modal was open for this reservation, update its local copy or close
      if (selectedReservation?.id === reservationId) {
        setSelectedReservation(null);
      }
    } catch (err) {
      console.error("Update reservation error:", err);
      addToast(err.message || "Failed to update reservation status", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = [
    {
      key: "id",
      label: "Ref / Bay",
      width: "150px",
      render: (val, row) => (
        <div className="table-slot-cell">
          <span className="font-bold text-main font-mono text-xs">
            {row.paymentReference || val.slice(0, 8).toUpperCase()}
          </span>
          <div className="flex-items-center gap-1 mt-1">
            <span className="slot-pill">{row.slotNumber || "Bay"}</span>
            <span className="slot-type-sub">{row.slotType || "Standard"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "userName",
      label: "Customer",
      render: (val, row) => (
        <div className="customer-info-cell">
          <div className="customer-name font-semibold text-main">{val || "Guest Customer"}</div>
          <div className="customer-email text-muted text-xs">{row.userEmail || "—"}</div>
        </div>
      ),
    },
    {
      key: "locationName",
      label: "Parking Hub",
      render: (val) => <span className="font-medium text-main">{val || "—"}</span>,
    },
    {
      key: "date",
      label: "Date & Timing",
      render: (val, row) => (
        <div className="booking-timing-cell">
          <div className="font-medium">{formatDate(val)}</div>
          <div className="text-muted text-xs">
            {formatTime12(row.startTime)} - {formatTime12(row.endTime)}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      width: "130px",
      align: "right",
      render: (_, row) => (
        <div>
          <div className="font-bold text-main">{formatCurrency(getReservationAmount(row))}</div>
          <span className={`payment-pill-xs pill-${row.paymentStatus || "unpaid"}`}>
            {row.paymentStatus || "Unpaid"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "120px",
      align: "center",
      render: (val) => <Badge type="reservation-status" value={val} label={val} size="sm" />,
    },
    {
      key: "actions",
      label: "Actions",
      width: "170px",
      align: "right",
      sortable: false,
      render: (_, row) => {
        const status = (row.status || "").toLowerCase();
        const isBusy = actionLoadingId === row.id;

        return (
          <div className="table-action-buttons">
            {/* View Details */}
            <button
              type="button"
              className="admin-action-btn view-btn"
              onClick={() => setSelectedReservation(row)}
              title="Inspect Full Booking Details"
            >
              <Eye size={14} />
            </button>

            {/* If pending: Approve */}
            {status === "pending" && (
              <button
                type="button"
                className="admin-action-btn approve-btn"
                onClick={() => handleUpdateStatus(row.id, "confirmed")}
                disabled={isBusy}
                title="Approve Reservation"
              >
                {isBusy ? <RefreshCw size={14} className="spin-animate" /> : <Check size={14} />}
              </button>
            )}

            {/* If active / confirmed: Complete or Cancel */}
            {(status === "confirmed" || status === "active") && (
              <>
                <button
                  type="button"
                  className="admin-action-btn complete-btn"
                  onClick={() => handleUpdateStatus(row.id, "completed")}
                  disabled={isBusy}
                  title="Mark Completed"
                >
                  {isBusy ? <RefreshCw size={14} className="spin-animate" /> : <CheckCircle size={14} />}
                </button>
                <button
                  type="button"
                  className="admin-action-btn cancel-btn"
                  onClick={() => handleUpdateStatus(row.id, "cancelled")}
                  disabled={isBusy}
                  title="Cancel Reservation (Release Bay)"
                >
                  {isBusy ? <RefreshCw size={14} className="spin-animate" /> : <XCircle size={14} />}
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="admin-management-page">
      {/* Page Header */}
      <div className="page-header-strip">
        <div>
          <h2 className="page-title">Reservations Management</h2>
          <p className="page-subtitle">
            Oversee active, upcoming, and past driver bookings. Approve pending requests, complete sessions, or release bay locks.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filters-card">
        <div className="filters-row">
          <div className="search-field-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by customer, email, bay, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm("")}
              >
                &times;
              </button>
            )}
          </div>

          <div className="filter-select-group">
            <label className="filter-label">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="admin-date-input"
            />
            {selectedDate && (
              <button
                type="button"
                className="filter-clear-link"
                onClick={() => setSelectedDate("")}
              >
                Clear
              </button>
            )}
          </div>

          <div className="filter-select-group">
            <label className="filter-label">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed / Active</option>
              <option value="pending">Pending Approval</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label className="filter-label">Hub:</label>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="admin-table-card">
        <Table
          columns={columns}
          data={filteredReservations}
          loading={loading}
          emptyTitle="No reservations found"
          emptyDescription="There are no reservations matching the chosen date, status, or search filters."
          pageSize={10}
        />
      </div>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <ReservationDetailModal
          isOpen={Boolean(selectedReservation)}
          onClose={() => setSelectedReservation(null)}
          reservation={selectedReservation}
          onUpdateStatus={handleUpdateStatus}
          actionLoading={actionLoadingId === selectedReservation.id}
        />
      )}
    </div>
  );
}
