import React, { useState } from "react";
import StatCard from "../components/common/StatCard";
import Table from "../components/common/Table";
import Badge from "../components/common/Badge";
import ReservationDetailModal from "../components/reservations/ReservationDetailModal";
import { useAdminLiveStats } from "../hooks/useAdminLiveStats";
import { updateReservationStatus } from "../services/adminService";
import { useToast } from "../hooks/useToast";
import {
  formatCurrency,
  formatDate,
  formatTime12,
  getReservationAmount,
} from "../utils/formatters";
import {
  MapPin,
  Layers,
  CheckCircle2,
  CalendarClock,
  Users,
  DollarSign,
  ArrowRight,
  Plus,
  BarChart2,
  Eye,
  Sparkles,
  AlertCircle,
  Car,
  Zap,
} from "lucide-react";

export default function AdminDashboardPage({ onNavigateTab }) {
  const {
    totalLocations,
    totalSlots,
    availableSlots,
    reservedSlots,
    maintenanceSlots,
    activeReservations,
    totalReservations,
    totalUsers,
    totalRevenue,
    recentReservations,
    loading,
    error,
  } = useAdminLiveStats();

  const { addToast } = useToast();
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleUpdateStatus = async (resId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateReservationStatus(resId, newStatus);
      addToast(`Reservation marked as ${newStatus}. Associated bay updated.`, "success");
      setSelectedReservation(null);
    } catch (err) {
      console.error("Status update error:", err);
      addToast(err.message || "Could not update status", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const occupancyRate = totalSlots > 0 ? Math.round(((totalSlots - availableSlots) / totalSlots) * 100) : 0;

  // Recent reservations columns
  const columns = [
    {
      key: "slotNumber",
      label: "Bay / Slot",
      width: "120px",
      render: (val, row) => (
        <div className="table-slot-cell">
          <span className="slot-pill">{val || "—"}</span>
          <span className="slot-type-sub">{row.slotType || "Standard"}</span>
        </div>
      ),
    },
    {
      key: "locationName",
      label: "Parking Hub",
      render: (val) => <span className="font-medium text-main">{val || "—"}</span>,
    },
    {
      key: "userName",
      label: "Customer",
      render: (val, row) => (
        <div>
          <div className="customer-name">{val || "Guest"}</div>
          <div className="customer-email">{row.userEmail || "—"}</div>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date & Time",
      render: (val, row) => (
        <div>
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
      align: "right",
      render: (_, row) => (
        <span className="font-bold text-main">{formatCurrency(getReservationAmount(row))}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (val) => <Badge type="reservation-status" value={val} label={val} size="sm" />,
    },
    {
      key: "actions",
      label: "Action",
      align: "center",
      sortable: false,
      render: (_, row) => (
        <button
          type="button"
          className="admin-action-btn view-btn"
          onClick={() => setSelectedReservation(row)}
          title="Inspect Details"
        >
          <Eye size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="admin-dashboard-view">
      {error && (
        <div className="admin-alert-banner alert-banner-error mb-4">
          <AlertCircle size={20} />
          <div>
            <strong>Firestore Sync Alert:</strong> {error.message || "Unable to sync some collections"}
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Summary Cards */}
      <section className="admin-stat-grid">
        <StatCard
          title="Total Locations"
          value={totalLocations}
          icon={MapPin}
          variant="primary"
          subtext="Active parking hubs"
          loading={loading}
          onClick={() => onNavigateTab && onNavigateTab("locations")}
        />

        <StatCard
          title="Total Parking Slots"
          value={totalSlots}
          icon={Layers}
          variant="purple"
          subtext={`${occupancyRate}% current occupancy`}
          loading={loading}
          onClick={() => onNavigateTab && onNavigateTab("slots")}
        />

        <StatCard
          title="Available Slots"
          value={availableSlots}
          icon={CheckCircle2}
          variant="emerald"
          subtext={`${reservedSlots} reserved • ${maintenanceSlots} maint.`}
          loading={loading}
          onClick={() => onNavigateTab && onNavigateTab("slots")}
        />

        <StatCard
          title="Active Reservations"
          value={activeReservations}
          icon={CalendarClock}
          variant="amber"
          subtext={`${totalReservations} all-time bookings`}
          loading={loading}
          onClick={() => onNavigateTab && onNavigateTab("reservations")}
        />

        <StatCard
          title="Registered Users"
          value={totalUsers}
          icon={Users}
          variant="cyan"
          subtext="Drivers on ParkLink"
          loading={loading}
        />

        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          variant="emerald"
          subtext="From completed & active bookings"
          loading={loading}
          onClick={() => onNavigateTab && onNavigateTab("reports")}
        />
      </section>

      {/* Quick Action Navigation Strip */}
      <section className="admin-quick-links-bar">
        <div className="quick-links-title">
          <span>Quick Actions</span>
        </div>
        <div className="quick-links-buttons">
          <button
            type="button"
            className="admin-quick-btn"
            onClick={() => onNavigateTab && onNavigateTab("locations")}
          >
            <Plus size={16} /> Add Location
          </button>
          <button
            type="button"
            className="admin-quick-btn"
            onClick={() => onNavigateTab && onNavigateTab("slots")}
          >
            <Layers size={16} /> Bulk Create Slots
          </button>
          <button
            type="button"
            className="admin-quick-btn"
            onClick={() => onNavigateTab && onNavigateTab("reservations")}
          >
            <CalendarClock size={16} /> Manage Bookings
          </button>
          <button
            type="button"
            className="admin-quick-btn"
            onClick={() => onNavigateTab && onNavigateTab("reports")}
          >
            <BarChart2 size={16} /> View Reports & Charts
          </button>
        </div>
      </section>

      {/* Dashboard Main Section: Recent Reservations & Live Status */}
      <section className="dashboard-content-split">
        {/* Recent Reservations Table */}
        <div className="dashboard-card card-stretch">
          <div className="card-header-flex">
            <div>
              <h3 className="card-heading">Recent Reservations</h3>
              <p className="card-subheading">Latest live booking transactions across all locations</p>
            </div>
            <button
              type="button"
              className="admin-link-btn"
              onClick={() => onNavigateTab && onNavigateTab("reservations")}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <Table
            columns={columns}
            data={recentReservations}
            loading={loading}
            emptyTitle="No recent reservations"
            emptyDescription="When customers reserve bays, bookings appear here in real time."
            pageSize={6}
          />
        </div>

        {/* Live Slot Status Breakdown Mini Card */}
        <div className="dashboard-card card-status-breakdown">
          <h3 className="card-heading">Bay Availability Status</h3>
          <p className="card-subheading">Live inventory distribution</p>

          <div className="slot-progress-bar-container">
            <div className="multi-progress-bar">
              <div
                className="progress-segment segment-available"
                style={{
                  width: `${totalSlots ? (availableSlots / totalSlots) * 100 : 0}%`,
                }}
                title={`Available: ${availableSlots}`}
              />
              <div
                className="progress-segment segment-reserved"
                style={{
                  width: `${totalSlots ? (reservedSlots / totalSlots) * 100 : 0}%`,
                }}
                title={`Reserved: ${reservedSlots}`}
              />
              <div
                className="progress-segment segment-maintenance"
                style={{
                  width: `${totalSlots ? (maintenanceSlots / totalSlots) * 100 : 0}%`,
                }}
                title={`Maintenance: ${maintenanceSlots}`}
              />
            </div>
          </div>

          <div className="slot-breakdown-legend">
            <div className="legend-row">
              <span className="legend-dot dot-available"></span>
              <span className="legend-label">Available Slots</span>
              <strong className="legend-val">{availableSlots}</strong>
            </div>
            <div className="legend-row">
              <span className="legend-dot dot-reserved"></span>
              <span className="legend-label">Reserved / Occupied</span>
              <strong className="legend-val">{reservedSlots}</strong>
            </div>
            <div className="legend-row">
              <span className="legend-dot dot-maintenance"></span>
              <span className="legend-label">Under Maintenance</span>
              <strong className="legend-val">{maintenanceSlots}</strong>
            </div>
          </div>

          <div className="card-tip-box mt-4">
            <Sparkles size={16} className="text-amber" />
            <p className="text-xs">
              <strong>Tip:</strong> You can manage single or bulk slots for any facility under the Slots tab.
            </p>
          </div>
        </div>
      </section>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <ReservationDetailModal
          isOpen={Boolean(selectedReservation)}
          onClose={() => setSelectedReservation(null)}
          reservation={selectedReservation}
          onUpdateStatus={handleUpdateStatus}
          actionLoading={isUpdatingStatus}
        />
      )}
    </div>
  );
}
