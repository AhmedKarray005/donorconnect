// src/validation/donation.validation.js

// For create (POST) and update (PUT) we will reuse this validator.
// `isPartial = true` means: for PUT, fields are optional but still validated if present.
export function validateDonationPayload(body, { isPartial = false } = {}) {
  const errors = {};

  function required(field, msg) {
    if (!isPartial && (body[field] === undefined || body[field] === null || body[field] === "")) {
      errors[field] = msg;
    }
  }

  required("title", "Title is required");
  required("category", "Category is required");
  required("quantity", "Quantity is required");
  required("pickupLocation", "Pickup location is required");
  required("availableDate", "Available date is required");

  if (body.quantity !== undefined) {
    if (typeof body.quantity !== "number" || Number.isNaN(body.quantity) || body.quantity <= 0) {
      errors.quantity = "Quantity must be a positive number";
    }
  }

  if (body.availableDate !== undefined) {
    const d = new Date(body.availableDate);
    if (Number.isNaN(d.getTime())) {
      errors.availableDate = "availableDate must be a valid date";
    }
  }

  if (body.status !== undefined) {
    const allowed = ["Open", "Reserved", "Completed", "Cancelled"];
    if (!allowed.includes(body.status)) {
      errors.status = `Status must be one of: ${allowed.join(", ")}`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
