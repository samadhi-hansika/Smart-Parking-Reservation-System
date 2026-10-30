import React, { useState, useEffect, useMemo } from "react";
import Modal from "../common/Modal";
import FormInput from "../common/FormInput";
import { validateBulkSlotForm } from "../../utils/validators";
import { RefreshCw, Layers, Check } from "lucide-react";

export default function BulkSlotModal({
  isOpen,
  onClose,
  onSubmit,
  locations = [],
  selectedLocationId = "",
  loading = false,
}) {
  const [formData, setFormData] = useState({
    locationId: selectedLocationId || locations[0]?.id || "",
    prefix: "A",
    startNumber: 1,
    count: 10,
    type: "car",
    price: 150,
    floor: "Level 1",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const activeLoc = locations.find((l) => l.id === selectedLocationId) || locations[0];
    setFormData((prev) => ({
      ...prev,
      locationId: activeLoc?.id || "",
      price: activeLoc?.pricePerHour || activeLoc?.price || 150,
    }));
    setErrors({});
  }, [selectedLocationId, locations, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "locationId") {
        const found = locations.find((l) => l.id === value);
        if (found) next.price = found.pricePerHour || found.price || 150;
      }
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Preview generated slot numbers
  const previewSlots = useMemo(() => {
    const prefix = (formData.prefix || "A").trim().toUpperCase();
    const start = Number(formData.startNumber) || 1;
    const count = Math.min(Number(formData.count) || 1, 20); // preview up to 20
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push(`${prefix}-${String(start + i).padStart(2, "0")}`);
    }
    return list;
  }, [formData.prefix, formData.startNumber, formData.count]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateBulkSlotForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const loc = locations.find((l) => l.id === formData.locationId);

    onSubmit({
      locationId: formData.locationId,
      locationName: loc?.name || "",
      prefix: formData.prefix.trim().toUpperCase(),
      startNumber: Number(formData.startNumber),
      count: Number(formData.count),
      type: formData.type,
      price: Number(formData.price),
      floor: formData.floor,
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
        <Layers size={16} className="mr-1" />
        Generate {formData.count || 0} Slots
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title="Bulk Create Parking Slots"
      subtitle="Instantly generate a sequence of bays with consistent numbering and pricing."
      footer={footer}
      size="md"
    >
      <form onSubmit={handleSubmit} className="admin-modal-form">
        <FormInput
          label="Target Location"
          name="locationId"
          type="select"
          value={formData.locationId}
          onChange={handleChange}
          options={locationOptions}
          error={errors.locationId}
          required
        />

        <div className="admin-form-row">
          <FormInput
            label="Prefix / Lane Code"
            name="prefix"
            value={formData.prefix}
            onChange={handleChange}
            placeholder="A, B, EV, etc."
            error={errors.prefix}
            required
            hint="Letter or code placed before slot index"
          />

          <FormInput
            label="Starting Number"
            name="startNumber"
            type="number"
            min="1"
            max="999"
            value={formData.startNumber}
            onChange={handleChange}
            error={errors.startNumber}
            required
          />
        </div>

        <div className="admin-form-row">
          <FormInput
            label="Quantity to Create"
            name="count"
            type="number"
            min="1"
            max="100"
            value={formData.count}
            onChange={handleChange}
            error={errors.count}
            required
            hint="Max 100 per batch"
          />

          <FormInput
            label="Floor / Level"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            placeholder="Level 1"
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
            label="Price per Hour (Rs.)"
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
          />
        </div>

        {/* Live Slot Numbers Preview */}
        <div className="bulk-preview-box">
          <span className="bulk-preview-label">
            Preview ({Number(formData.count) || 0} slots will be generated):
          </span>
          <div className="bulk-preview-tags">
            {previewSlots.map((tag) => (
              <span key={tag} className="bulk-slot-chip">
                {tag}
              </span>
            ))}
            {Number(formData.count) > 20 && (
              <span className="bulk-slot-chip chip-more">
                +{Number(formData.count) - 20} more...
              </span>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
