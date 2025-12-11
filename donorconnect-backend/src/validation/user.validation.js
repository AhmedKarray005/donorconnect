// src/validation/user.validation.js

export function validateUserPayload(body, { isPartial = false, isRegister = false } = {}) {
  const errors = {};

  function required(field, msg) {
    if (!isPartial && (body[field] === undefined || body[field] === null || body[field] === "")) {
      errors[field] = msg;
    }
  }

  required("name", "Name is required");
  required("email", "Email is required");

  if (isRegister && (!body.password || body.password.trim() === "")) {
    errors.password = "Password is required";
  }

  if (body.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      errors.email = "Invalid email format";
    }
  }

  // role
  if (body.role !== undefined) {
    const allowedRoles = ["donor", "npo", "admin"];
    if (!allowedRoles.includes(body.role)) {
      errors.role = `Role must be one of: ${allowedRoles.join(", ")}`;
    }
  }

  // ---- role-specific extra fields ----
  const role = body.role || "donor";

  if (!isPartial && isRegister) {
    if (role === "donor") {
      // donor: address required
      if (!body.address || body.address.trim() === "") {
        errors.address = "Address is required for donors";
      }
    }

    if (role === "npo") {
      if (!body.organizationName || body.organizationName.trim() === "") {
        errors.organizationName = "organizationName is required for NPOs";
      }
      if (!body.mission || body.mission.trim() === "") {
        errors.mission = "mission is required for NPOs";
      }
      if (!body.city || body.city.trim() === "") {
        errors.city = "city is required for NPOs";
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
