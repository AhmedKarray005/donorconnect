import express from "express";
import {
  listDonations,
  listMyDonations,
  getDonation,
  createDonation,
  updateDonation,
  deleteDonation
} from "../controllers/donation.controller.js";
import {
  authenticateToken,
  requireRole
} from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// important: /mine before /:id
router.get("/", listDonations);
router.get("/mine", authenticateToken, requireRole("donor"), listMyDonations);
router.get("/:id", getDonation);

// for create: add upload.single("image")
router.post(
  "/",
  authenticateToken,
  requireRole("donor"),
  upload.single("image"),
  createDonation
);

router.put("/:id", authenticateToken, requireRole("donor"), updateDonation);
router.delete("/:id", authenticateToken, requireRole("donor"), deleteDonation);

export default router;
