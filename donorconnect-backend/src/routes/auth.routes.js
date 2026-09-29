// src/routes/auth.routes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateUserPayload } from "../validation/user.validation.js";
import { getJwtSecret } from "../config/auth.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    if (req.body.role !== undefined && !["donor", "npo"].includes(req.body.role)) {
      return res.status(400).json({
        error: "Validation failed",
        fields: { role: "Public registration only supports donor and npo roles" }
      });
    }
    // 1) VALIDATION FIRST
    const validation = validateUserPayload(req.body, { isRegister: true });

    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        fields: validation.errors
      });
    }

    // 2) THEN SAME LOGIC AS BEFORE
    const { name, email, password, role, phone, address, organizationName, mission, city } = req.body;

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "donor",
      phone,
      address,
      organizationName,
      mission,
      city
    });

    const safe = user.toObject();
    delete safe.password;

    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, email: user.email },
      getJwtSecret(),
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
});
// GET /api/auth/me
router.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});


export default router;
