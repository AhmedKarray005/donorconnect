// src/validation/request.validation.js
import mongoose from "mongoose";

export function validateRequestPayload(body, { isPartial = false } = {}) {
  const errors = {};

  function required(field, msg) {
    if (!isPartial && (body[field] === undefined || body[field] === null || body[field] === "")) {
      errors[field] = msg;
    }
  }

  // donationId is required for create
  required("donationId", "donationId is required");

  // NEW: message and scheduledDate required for create (not for partial updates)
  required("message", "message is required");
  required("scheduledDate", "scheduledDate is required");

  // donationId validation
  if (body.donationId !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(body.donationId)) {
      errors.donationId = "Invalid donationId format";
    }
  }

  // scheduledDate validation
  if (body.scheduledDate !== undefined) {
    const d = new Date(body.scheduledDate);
    if (Number.isNaN(d.getTime())) {
      errors.scheduledDate = "scheduledDate must be a valid date";
    }
  }

  // message must be non-empty string if provided
  if (body.message !== undefined) {
    if (typeof body.message !== "string" || body.message.trim() === "") {
      errors.message = "message must be a non-empty string";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
