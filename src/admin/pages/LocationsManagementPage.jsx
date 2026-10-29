import React, { useState, useMemo } from "react";
import Table from "../components/common/Table";
import Badge from "../components/common/Badge";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LocationFormModal from "../components/locations/LocationFormModal";
import { useLocations } from "../hooks/useLocations";
import {
  createLocation,
  updateLocation,
  deleteLocation,
} from "../services/adminService";
import { useToast } from "../hooks/useToast";
import { formatCurrency, formatDate } from "../utils/formatters";
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  MapPin,
  Building,
  Filter,
  RefreshCw,
  Search,
} from "lucide-react";

export default function LocationsManagementPage({ onNavigateToSlots }) {
  const { locations, loading, refresh } = useLocations();
  const { addToast } = useToast();

  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Unique cities list for filter
  const cities = useMemo(() => {
    const set = new Set(locations.map((l) => l.city).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [locations]);

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchCity = selectedCity === "all" || loc.city === selectedCity;
      const matchStatus = selectedStatus === "all" || loc.status === selectedStatus;
      const matchSearch =
        !searchTerm.trim() ||
        loc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.city?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCity && matchStatus && matchSearch;
    });
  }, [locations, selectedCity, selectedStatus, searchTerm]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingLocation(null);
    setModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (location) => {
    setEditingLocation(location);
    setModalOpen(true);
  };

  // Open Delete confirmation
  const handleOpenDelete = (location) => {
    setLocationToDelete(location);
    setDeleteDialogOpen(true);
  };

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, formData);
        addToast(`Location "${formData.name}" updated successfully.`, "success");
      } else {
        await createLocation(formData);
        addToast(`New location "${formData.name}" created successfully.`, "success");
      }
      setModalOpen(false);
      setEditingLocation(null);
    } catch (err) {
      console.error("Save location error:", err);
      addToast(err.message || "Failed to save location", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!locationToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLocation(locationToDelete.id);
      addToast(`Location "${locationToDelete.name}" and its bays deleted.`, "success");
      setDeleteDialogOpen(false);
      setLocationToDelete(null);
    } catch (err) {
      console.error("Delete location error:", err);
      addToast(err.message || "Could not delete location", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Parking Hub & Address",
      render: (val, row) => (
        <div className="location-name-cell">
          <div className="location-title font-bold text-main">{val}</div>
          <div className="location-address text-muted text-xs flex-items-center">
            <MapPin size={12} className="mr-1 inline" /> {row.address || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "city",
      label: "City",
      width: "120px",
      render: (val) => <span className="city-pill">{val || "—"}</span>,
    },
    {
      key: "totalSlots",
      label: "Capacity",
      width: "110px",
      align: "center",
      render: (val, row) => (
        <span className="font-semibold text-main">{val || 0} bays</span>
      ),
    },
    {
      key: "pricePerHour",
      label: "Hourly Rate",
      width: "140px",
      align: "right",
      render: (val) => (
        <span className="font-bold text-emerald">{formatCurrency(val)}/hr</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "120px",
      align: "center",
      render: (val) => <Badge type="location-status" value={val} label={val} size="sm" />,
    },
    {
      key: "actions",
      label: "Actions",
      width: "180px",
      align: "right",
      sortable: false,
      render: (_, row) => (
        <div className="table-action-buttons">
          <button
            type="button"
            className="admin-action-btn slots-btn"
            onClick={() => onNavigateToSlots && onNavigateToSlots(row.id)}
            title="Manage Bays for this Hub"
          >
            <Layers size={14} />
            <span className="btn-label-sm">Bays</span>
          </button>
          <button
            type="button"
            className="admin-action-btn edit-btn"
            onClick={() => handleOpenEdit(row)}
            title="Edit Location"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className="admin-action-btn delete-btn"
            onClick={() => handleOpenDelete(row)}
            title="Delete Location"
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
          <h2 className="page-title">Locations Management</h2>
          <p className="page-subtitle">
            Configure parking hubs, city centers, capacity allocations, and base hourly tariffs.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={handleOpenAdd}
        >
          <Plus size={16} /> Add New Location
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filters-card">
        <div className="filters-row">
          <div className="search-field-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, address, or city..."
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
            <label className="filter-label">City:</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="admin-filter-select"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city === "all" ? "All Cities" : city}
                </option>
              ))}
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <button
            type="button"
            className="admin-btn admin-btn-ghost btn-sm ml-auto"
            onClick={refresh}
            title="Refresh locations"
          >
            <RefreshCw size={14} className={loading ? "spin-animate" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Locations Table */}
      <div className="admin-table-card">
        <Table
          columns={columns}
          data={filteredLocations}
          loading={loading}
          emptyTitle="No locations found"
          emptyDescription="No parking hubs match the selected filters or search terms."
          emptyAction={
            <button type="button" className="admin-btn admin-btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={14} /> Add First Location
            </button>
          }
          pageSize={8}
        />
      </div>

      {/* Add / Edit Location Modal */}
      {modalOpen && (
        <LocationFormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingLocation(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingLocation}
          loading={isSubmitting}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && locationToDelete && (
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setLocationToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title={`Delete "${locationToDelete.name}"?`}
          message="Are you sure you want to delete this parking hub? This will also remove all associated bays."
          details="Note: Deletion will be blocked if any active customer reservations exist for this hub."
          confirmText="Yes, Delete Hub"
          variant="danger"
          loading={isDeleting}
        />
      )}
    </div>
  );
}
