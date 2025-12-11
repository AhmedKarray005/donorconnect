import express from "express";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  initFirstAdmin
} from "../controllers/user.controller.js";
import {
  authenticateToken,
  requireRole
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Bootstrap: create first admin (only works if no admins exist)
router.post("/init-admin", initFirstAdmin);

// Only admin can list or manage users (example)
router.get("/", authenticateToken, requireRole("admin"), listUsers);
router.get("/:id", authenticateToken, requireRole("admin"), getUser);
router.post("/", authenticateToken, requireRole("admin"), createUser);
router.put("/:id", authenticateToken, requireRole("admin"), updateUser);
router.delete("/:id", authenticateToken, requireRole("admin"), deleteUser);

export default router;
