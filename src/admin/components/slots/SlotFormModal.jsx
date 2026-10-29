import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import FormInput from "../common/FormInput";
import { validateSlotForm } from "../../utils/validators";
import { RefreshCw } from "lucide-react";

export default function SlotFormModal({
  isOpen,
  onClose,
  onSubmit,
  locations = [],
  initialData = null,
  selectedLocationId = "",
  loading = false,
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    locationId: selectedLocationId || locations[0]?.id || "",
    slotNumber: "",
    type: "car",
    status: "available",
    price: 150,
    floor: "Level 1",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        locationId: initialData.locationId || selectedLocationId || locations[0]?.id || "",
        slotNumber: initialData.slotNumber || "",
        type: initialData.type || "car",
        status: initialData.status || "available",
        price: initialData.price ?? 150,
        floor: initialData.floor || "Level 1",
      });
      setErrors({});
    } else {
      const activeLoc = locations.find((l) => l.id === selectedLocationId) || locations[0];
      setFormData({
        locationId: activeLoc?.id || "",
        slotNumber: "",
        type: "car",
        status: "available",
        price: activeLoc?.pricePerHour || activeLoc?.price || 150,
        floor: "Level 1",
      });
      setErrors({});
    }
  }, [initialData, isOpen, selectedLocationId, locations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // When location changes on a new slot, auto-update price to location rate
      if (name === "locationId" && !isEdit) {
        const found = locations.find((l) => l.id === value);
        if (found) {
          next.price = found.pricePerHour || found.price || 150;
        }
      }
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateSlotForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const loc = locations.find((l) => l.id === formData.locationId);

    onSubmit({
      ...formData,
      locationName: loc?.name || "",
      price: Number(formData.price),
    });
  };

  const locationOptions = locations.map((loc) => ({
    value: loc.id,
    label: `${loc.name} (${loc.city})`,
  }));

  const typeOptions = [
    { value: "car", label: "Standard Car" },
    { value: "EV", label: "Electric Vehicle (EV Charging)" },
    { value: "bike", label: "Motorcycle / Bike" },
    { value: "disabled", label: "Accessible / Disabled Bay" },
  ];

  const statusOptions = [
    { value: "available", label: "Available" },
    { value: "reserved", label: "Reserved" },
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
        {isEdit ? "Update Bay" : "Add Bay"}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title={isEdit ? `Edit Slot ${initialData?.slotNumber || ""}` : "Add Individual Parking Slot"}
      subtitle="Configure bay identifier, vehicle compatibility, and hourly rate."
      footer={footer}
      size="md"
    >
      <form onSubmit={handleSubmit} className="admin-modal-form">
        <FormInput
          label="Parking Location"
          name="locationId"
          type="select"
          value={formData.locationId}
          onChange={handleChange}
          options={locationOptions}
          error={errors.locationId}
          disabled={isEdit}
          required
        />

        <div className="admin-form-row">
          <FormInput
            label="Slot Number"
            name="slotNumber"
            value={formData.slotNumber}
            onChange={handleChange}
            placeholder="e.g., A-01, EV-02"
            error={errors.slotNumber}
            required
            hint="Unique code displayed on the physical parking bay."
          />

          <FormInput
            label="Floor / Level"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            placeholder="Level 1, Basement, etc."
          />
        </div>

        <div className="admin-form-row">
          <FormInput
            label="Vehicle Type"
            name="type"
            type="select"
            value={formData.type}
            onChange={handleChange}
            options={typeOptions}
            error={errors.type}
            required
          />

          <FormInput
            label="Slot Status"
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
          label="Hourly Price (Rs.)"
          name="price"
          type="number"
          min="0"
          step="10"
          value={formData.price}
          onChange={handleChange}
          prefix="Rs."
          suffix="/hr"
          error={errors.price}
          required
          hint="Defaults to the location's base hourly rate."
        />
      </form>
    </Modal>
  );
}
