/**
 * ParkLink Admin Module - Form Validators
 */

export function validateLocationForm(formData) {
  const errors = {};

  if (!formData.name || !formData.name.trim()) {
    errors.name = "Location name is required.";
  } else if (formData.name.trim().length < 3) {
    errors.name = "Location name must be at least 3 characters.";
  }

  if (!formData.address || !formData.address.trim()) {
    errors.address = "Street address is required.";
  }

  if (!formData.city || !formData.city.trim()) {
    errors.city = "City is required.";
  }

  const totalSlots = Number(formData.totalSlots);
  if (formData.totalSlots === "" || formData.totalSlots === null || isNaN(totalSlots)) {
    errors.totalSlots = "Total slots is required.";
  } else if (!Number.isInteger(totalSlots) || totalSlots < 1) {
    errors.totalSlots = "Total slots must be a positive integer.";
  }

  const pricePerHour = Number(formData.pricePerHour);
  if (formData.pricePerHour === "" || formData.pricePerHour === null || isNaN(pricePerHour)) {
    errors.pricePerHour = "Price per hour is required.";
  } else if (pricePerHour < 0) {
    errors.pricePerHour = "Price per hour cannot be negative.";
  }

  if (!formData.status) {
    errors.status = "Please select a status.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSlotForm(formData) {
  const errors = {};

  if (!formData.locationId) {
    errors.locationId = "Please select a parking location.";
  }

  if (!formData.slotNumber || !formData.slotNumber.trim()) {
    errors.slotNumber = "Slot number is required (e.g., A-01, B-12).";
  }

  if (!formData.type) {
    errors.type = "Please select a slot type.";
  }

  if (!formData.status) {
    errors.status = "Please select an initial status.";
  }

  const price = Number(formData.price);
  if (formData.price === "" || formData.price === null || isNaN(price)) {
    errors.price = "Slot hourly price is required.";
  } else if (price < 0) {
    errors.price = "Price cannot be negative.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateBulkSlotForm(formData) {
  const errors = {};

  if (!formData.locationId) {
    errors.locationId = "Please select a parking location.";
  }

  if (!formData.prefix || !formData.prefix.trim()) {
    errors.prefix = "Lane or Bay prefix is required (e.g., A, B, EV).";
  }

  const startNumber = Number(formData.startNumber);
  if (isNaN(startNumber) || startNumber < 1) {
    errors.startNumber = "Start number must be at least 1.";
  }

  const count = Number(formData.count);
  if (isNaN(count) || count < 1) {
    errors.count = "Quantity must be at least 1.";
  } else if (count > 100) {
    errors.count = "Maximum bulk slots creation at once is 100.";
  }

  const price = Number(formData.price);
  if (isNaN(price) || price < 0) {
    errors.price = "Price must be a valid number >= 0.";
  }

  if (!formData.type) {
    errors.type = "Please select a slot type.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
