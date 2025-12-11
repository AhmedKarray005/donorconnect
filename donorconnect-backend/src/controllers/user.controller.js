// src/controllers/user.controller.js
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// POST /api/users/init-admin (bootstrap: create first admin only if none exist)
export async function initFirstAdmin(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }

    // Check if any admin already exists
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return res
        .status(403)
        .json({ error: "An admin already exists. Use authenticated endpoint to create more users." });
    }

    // Check if email is already used
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "admin"
    });

    const safe = user.toObject();
    delete safe.password;

    res.status(201).json({
      message: "First admin created successfully",
      user: safe
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/users
export async function listUsers(req, res, next) {
  try {
    const users = await User.find().select("-password").lean();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id
export async function getUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

// POST /api/users  (simple admin CRUD; not for register)
export async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password, // plain here; for real usage prefer using register endpoint (hashed)
      role: role || "donor"
    });

    const safe = user.toObject();
    delete safe.password;

    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/:id
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // do not allow changing password here
    delete updates.password;
const validation = validateUserPayload(req.body, { isPartial: true });

if (!validation.isValid) {
  return res.status(400).json({
    error: "Validation failed",
    fields: validation.errors
  });
}

    const updated = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .select("-password")
      .lean();

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/:id
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    const deleted = await User.findByIdAndDelete(id).lean();
    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
