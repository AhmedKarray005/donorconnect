import express from "express";
import {
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
} from "../repositories/donation.repository.js";

const router = express.Router();

// GET all
router.get("/", async (req, res, next) => {
  try {
    const donations = await getAllDonations();
    res.status(200).json(donations);
  } catch (err) {
    next(err);
  }
});

// GET by ID
router.get("/:id", async (req, res, next) => {
  try {
    const donation = await getDonationById(req.params.id);

    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.status(200).json(donation);
  } catch (err) {
    next(err);
  }
});

// POST create
router.post("/", async (req, res, next) => {
  try {
    const saved = await createDonation(req.body);
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

// PUT update
router.put("/:id", async (req, res, next) => {
  try {
    const updated = await updateDonation(req.params.id, req.body);

    if (!updated.value && !updated) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE remove
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await deleteDonation(req.params.id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
