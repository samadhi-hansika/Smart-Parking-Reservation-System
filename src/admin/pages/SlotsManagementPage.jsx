import React, { useState, useEffect, useMemo } from "react";
import Table from "../components/common/Table";
import Badge from "../components/common/Badge";
import ConfirmDialog from "../components/common/ConfirmDialog";
import SlotFormModal from "../components/slots/SlotFormModal";
import BulkSlotModal from "../components/slots/BulkSlotModal";
import { useLocations } from "../hooks/useLocations";
import {
  subscribeSlots,
  createSlot,
  updateSlot,
  deleteSlot,
  bulkCreateSlots,
  checkSlotHasActiveReservations,
} from "../services/adminService";
import { useToast } from "../hooks/useToast";
import { formatCurrency } from "../utils/formatters";
import {
  Plus,
  Layers,
  Edit2,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Car,
  Zap,
} from "lucide-react";

export default function SlotsManagementPage({ initialLocationId = "" }) {
  const { locations, loading: locationsLoading } = useLocations();
  const { addToast } = useToast();

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedLocationId, setSelectedLocationId] = useState(initialLocationId);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete protection states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeReservationBlocked, setActiveReservationBlocked] = useState(null);

  // Sync initialLocationId prop if passed
  useEffect(() => {
    if (initialLocationId) {
      setSelectedLocationId(initialLocationId);
    }
  }, [initialLocationId]);

  // Subscribe to slots
  useEffect(() => {
    setLoading(true);
    const locFilter = selectedLocationId === "all" ? null : selectedLocationId || null;
    const unsubscribe = subscribeSlots(
      locFilter,
      (data) => {
        setSlots(data);
        setLoading(false);
      },
      (err) => {
        console.error("Slots subscription error:", err);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedLocationId]);

  // Filtered Slots
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchType = selectedType === "all" || (slot.type || "").toLowerCase() === selectedType.toLowerCase();
      const matchStatus =
        selectedStatus === "all" || (slot.status || "").toLowerCase() === selectedStatus.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        slot.slotNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.locationName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchStatus && matchSearch;
    });
  }, [slots, selectedType, selectedStatus, searchTerm]);

  // Handle Add Single Slot
  const handleOpenAdd = () => {
    setEditingSlot(null);
    setSlotModalOpen(true);
  };

  // Handle Edit Slot
  const handleOpenEdit = (slot) => {
    setEditingSlot(slot);
    setSlotModalOpen(true);
  };

  // Handle Delete Click with active reservation check
  const handleOpenDelete = async (slot) => {
    setSlotToDelete(slot);
    setActiveReservationBlocked(null);

    // Proactively check active reservations
    try {
      const check = await checkSlotHasActiveReservations(slot.id);
      if (check.hasActive) {
        setActiveReservationBlocked(check.reservations[0]);
      }
    } catch (err) {
      console.error("Error checking reservations:", err);
    }

    setDeleteDialogOpen(true);
  };

  // Submit Single Slot (Add or Update)
  const handleSingleSlotSubmit = async (slotData) => {
    setIsSubmitting(true);
    try {
      if (editingSlot) {
        await updateSlot(editingSlot.id, slotData);
        addToast(`Slot ${slotData.slotNumber} updated successfully.`, "success");
      } else {
        await createSlot(slotData);
        addToast(`Slot ${slotData.slotNumber} created successfully.`, "success");
      }
      setSlotModalOpen(false);
      setEditingSlot(null);
    } catch (err) {
      console.error("Save slot error:", err);
      addToast(err.message || "Failed to save slot", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Bulk Slots
  const handleBulkSubmit = async (bulkData) => {
    setIsSubmitting(true);
    try {
      const res = await bulkCreateSlots(bulkData);
      if (res.createdCount > 0) {
        addToast(
          `Successfully created ${res.createdCount} bays! ${
            res.skippedCount > 0 ? `(${res.skippedCount} skipped as already existing)` : ""
          }`,
          "success",
          5000
        );
      } else {
        addToast("All specified slot numbers already exist in this location.", "warning");
      }
      setBulkModalOpen(false);
    } catch (err) {
      console.error("Bulk slot creation error:", err);
      addToast(err.message || "Bulk creation failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!slotToDelete) return;
    if (activeReservationBlocked) {
      addToast(
        `Cannot delete: Bay has an active reservation (#${activeReservationBlocked.id.slice(0, 6)}).`,
        "error"
      );
      setDeleteDialogOpen(false);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSlot(slotToDelete.id, slotToDelete.slotNumber);
      addToast(`Bay ${slotToDelete.slotNumber} was deleted.`, "success");
      setDeleteDialogOpen(false);
      setSlotToDelete(null);
    } catch (err) {
      console.error("Delete slot error:", err);
      addToast(err.message || "Could not delete slot", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Lookup location name for display
  const getLocationName = (locId, fallback) => {
    if (fallback) return fallback;
    const found = locations.find((l) => l.id === locId);
    return found ? found.name : "Unknown Hub";
  };

  const columns = [
    {
      key: "slotNumber",
      label: "Slot Number",
      width: "130px",
      render: (val, row) => (
        <div className="table-slot-cell">
          <span className="slot-pill font-mono font-bold text-main">{val}</span>
          <span className="slot-type-sub">{row.lane ? `Lane ${row.lane}` : row.floor || "Level 1"}</span>
        </div>
      ),
    },
    {
      key: "locationName",
      label: "Parking Location",
      render: (val, row) => (
        <span className="font-medium text-main">{getLocationName(row.locationId, val)}</span>
      ),
    },
    {
      key: "type",
      label: "Vehicle Compatibility",
      width: "180px",
      render: (val) => <Badge type="vehicle-type" value={val} label={val} size="sm" />,
    },
    {
      key: "price",
      label: "Hourly Rate",
      width: "130px",
      align: "right",
      render: (val) => <span className="font-bold text-main">{formatCurrency(val)}/hr</span>,
    },
    {
      key: "status",
      label: "Status",
      width: "130px",
      align: "center",
      render: (val) => <Badge type="slot-status" value={val} label={val} size="sm" />,
    },
    {
      key: "actions",
      label: "Actions",
      width: "120px",
      align: "right",
      sortable: false,
      render: (_, row) => (
        <div className="table-action-buttons">
          <button
            type="button"
            className="admin-action-btn edit-btn"
            onClick={() => handleOpenEdit(row)}
            title="Edit Slot"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className="admin-action-btn delete-btn"
            onClick={() => handleOpenDelete(row)}
            title="Delete Slot"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-management-page">
      {/* Page Header */}
      <div className="page-header-strip">
        <div>
          <h2 className="page-title">Parking Slots Management</h2>
          <p className="page-subtitle">
            Configure individual bay numbering, vehicle classification (EV/Car/Bike/Disabled), and pricing.
          </p>
        </div>
        <div className="header-action-buttons">
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => setBulkModalOpen(true)}
          >
            <Layers size={16} /> Bulk Create Slots
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleOpenAdd}
          >
            <Plus size={16} /> Add Individual Slot
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filters-card">
        <div className="filters-row">
          <div className="search-field-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by slot (e.g. A-01, EV)..."
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
            <label className="filter-label">Location:</label>
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

          <div className="filter-select-group">
            <label className="filter-label">Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Types</option>
              <option value="car">Standard Car</option>
              <option value="EV">Electric Vehicle (EV)</option>
              <option value="bike">Motorcycle / Bike</option>
              <option value="disabled">Disabled / Accessible</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label className="filter-label">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Slots Table */}
      <div className="admin-table-card">
        <Table
          columns={columns}
          data={filteredSlots}
          loading={loading || locationsLoading}
          emptyTitle="No parking slots found"
          emptyDescription="No bays match the chosen location or criteria. You can create bays individually or in bulk."
          emptyAction={
            <div className="empty-btn-group">
              <button
                type="button"
                className="admin-btn admin-btn-outline btn-sm"
                onClick={() => setBulkModalOpen(true)}
              >
                <Layers size={14} /> Bulk Generate Bays
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary btn-sm ml-2"
                onClick={handleOpenAdd}
              >
                <Plus size={14} /> Add Single Bay
              </button>
            </div>
          }
          pageSize={10}
        />
      </div>

      {/* Single Slot Modal */}
      {slotModalOpen && (
        <SlotFormModal
          isOpen={slotModalOpen}
          onClose={() => {
            setSlotModalOpen(false);
            setEditingSlot(null);
          }}
          onSubmit={handleSingleSlotSubmit}
          locations={locations}
          initialData={editingSlot}
          selectedLocationId={selectedLocationId === "all" ? "" : selectedLocationId}
          loading={isSubmitting}
        />
      )}

      {/* Bulk Slot Modal */}
      {bulkModalOpen && (
        <BulkSlotModal
          isOpen={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          onSubmit={handleBulkSubmit}
          locations={locations}
          selectedLocationId={selectedLocationId === "all" ? "" : selectedLocationId}
          loading={isSubmitting}
        />
      )}

      {/* Delete Confirmation Dialog with Active Reservation Protection */}
      {deleteDialogOpen && slotToDelete && (
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSlotToDelete(null);
            setActiveReservationBlocked(null);
          }}
          onConfirm={handleConfirmDelete}
          title={
            activeReservationBlocked
              ? `Deletion Blocked: Bay ${slotToDelete.slotNumber}`
              : `Delete Bay ${slotToDelete.slotNumber}?`
          }
          message={
            activeReservationBlocked
              ? `This parking bay cannot be deleted because it is currently attached to an ACTIVE customer reservation (#${activeReservationBlocked.id.slice(
                  0,
                  6
                )}) on ${activeReservationBlocked.date || "today"}.`
              : `Are you sure you want to permanently remove bay ${slotToDelete.slotNumber} from this parking location?`
          }
          details={
            activeReservationBlocked ? (
              <div className="active-res-blocked-banner">
                <AlertCircle size={18} className="text-rose mr-2 inline" />
                <span>
                  To remove this bay, first go to <strong>Reservations Management</strong> and either
                  complete or cancel the active booking.
                </span>
              </div>
            ) : (
              "Drivers will no longer be able to discover or book this bay."
            )
          }
          confirmText={activeReservationBlocked ? "I Understand (Cannot Delete)" : "Yes, Delete Bay"}
          cancelText={activeReservationBlocked ? "Close" : "Cancel"}
          variant={activeReservationBlocked ? "warning" : "danger"}
          loading={isDeleting}
        />
      )}
    </div>
  );
}
