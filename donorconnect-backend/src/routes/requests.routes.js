import express from "express";
import {
  listRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest
} from "../controllers/request.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticateToken, listRequests);
router.get("/:id", authenticateToken, getRequest);
router.post("/", authenticateToken, createRequest);
router.put("/:id", authenticateToken, updateRequest);
router.delete("/:id", authenticateToken, deleteRequest);

// state transitions
router.patch("/:id/accept", authenticateToken, acceptRequest);
router.patch("/:id/reject", authenticateToken, rejectRequest);
router.patch("/:id/cancel", authenticateToken, cancelRequest);

export default router;
