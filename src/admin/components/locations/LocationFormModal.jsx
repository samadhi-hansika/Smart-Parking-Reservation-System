import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import FormInput from "../common/FormInput";
import { validateLocationForm } from "../../utils/validators";
import { RefreshCw, MapPin, Building, Hash, DollarSign, Activity } from "lucide-react";

export default function LocationFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "Colombo",
    totalSlots: 20,
    pricePerHour: 150,
    status: "active",
    description: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        address: initialData.address || "",
        city: initialData.city || "Colombo",
        totalSlots: initialData.totalSlots ?? 20,
        pricePerHour: initialData.pricePerHour ?? initialData.price ?? 150,
        status: initialData.status || "active",
        description: initialData.description || "",
      });
      setErrors({});
    } else {
      setFormData({
        name: "",
        address: "",
        city: "Colombo",
        totalSlots: 20,
        pricePerHour: 150,
        status: "active",
        description: "",
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateLocationForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit({
      ...formData,
      totalSlots: Number(formData.totalSlots),
      pricePerHour: Number(formData.pricePerHour),
    });
  };

  const cityOptions = [
    { value: "Colombo", label: "Colombo" },
    { value: "Kandy", label: "Kandy" },
    { value: "Galle", label: "Galle" },
    { value: "Negombo", label: "Negombo" },
    { value: "Jaffna", label: "Jaffna" },
    { value: "Kurunegala", label: "Kurunegala" },
    { value: "Matara", label: "Matara" },
  ];

  const statusOptions = [
    { value: "active", label: "Active (Accepting Bookings)" },
    { value: "inactive", label: "Inactive (Temporarily Hidden)" },
    { value: "maintenance", label: "Under Maintenance" },
  ];

  const footer = (
    <div className="admin-form-actions">
      <button
        type="button"
        className="admin-btn admin-btn-ghost"
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="button"
        className="admin-btn admin-btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading && <RefreshCw size={15} className="spin-animate mr-2" />}
        {isEdit ? "Update Location" : "Create Location"}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title={isEdit ? "Edit Parking Location" : "Add New Parking Location"}
      subtitle={
        isEdit
          ? "Update details, pricing, and operating status for this facility."
          : "Register a new smart parking hub into the ParkLink network."
      }
      footer={footer}
      size="md"
    >
      <form onSubmit={handleSubmit} className="admin-modal-form">
        <FormInput
          label="Location Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Colombo City Centre Deck"
          error={errors.name}
          required
        />

        <div className="admin-form-row">
          <FormInput
            label="City"
            name="city"
            type="select"
            value={formData.city}
            onChange={handleChange}
            options={cityOptions}
            error={errors.city}
            required
          />

          <FormInput
            label="Status"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            error={errors.status}
            required
          />
        </div>

        <FormInput
          label="Street Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="e.g., 137 Sir James Pieris Mawatha"
          error={errors.address}
          required
        />

        <div className="admin-form-row">
          <FormInput
            label="Total Capacity (Slots)"
            name="totalSlots"
            type="number"
            min="1"
            max="1000"
            value={formData.totalSlots}
            onChange={handleChange}
            placeholder="24"
            error={errors.totalSlots}
            required
          />

          <FormInput
            label="Price Per Hour"
            name="pricePerHour"
            type="number"
            min="0"
            step="10"
            value={formData.pricePerHour}
            onChange={handleChange}
            placeholder="150"
            prefix="Rs."
            suffix="/hr"
            error={errors.pricePerHour}
            required
          />
        </div>

        <FormInput
          label="Description & Facilities"
          name="description"
          type="textarea"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe security, EV chargers, elevator, valet, or roof coverage..."
          hint="Brief overview shown to drivers during spot discovery."
        />
      </form>
    </Modal>
  );
}
