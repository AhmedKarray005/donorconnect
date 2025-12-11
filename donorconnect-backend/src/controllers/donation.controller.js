// src/controllers/donation.controller.js
import Donation from "../models/donation.model.js";
import { validateDonationPayload } from "../validation/donation.validation.js";
import mongoose from "mongoose";

// GET /api/donations
export async function listDonations(req, res, next) {
  try {
    // Query params
    let { page = 1, limit = 10, status, category, q } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (Number.isNaN(page) || page < 1) page = 1;
    if (Number.isNaN(limit) || limit < 1 || limit > 100) limit = 10;

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (status) {
      filter.status = status; // must match enum values: Open, Reserved, Completed, Cancelled
    }

    if (category) {
      filter.category = category;
    }

    if (q) {
      // simple text search in title and description
      const regex = new RegExp(q, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const [items, total] = await Promise.all([
      Donation.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Donation.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      data: items,
      page,
      limit,
      total,
      totalPages
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/donations/mine  (donor only)
export async function listMyDonations(req, res, next) {
  try {
    const filter = { donorId: req.user.id };
    const donations = await Donation.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(donations);
  } catch (err) {
    next(err);
  }
}

// GET /api/donations/:id
export async function getDonation(req, res, next) {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id).lean();

    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.status(200).json(donation);
  } catch (err) {
    next(err);
  }
}

export async function createDonation(req, res, next) {
  try {
    // Body from multipart/form-data is all strings → adjust
    const body = { ...req.body };

    if (body.quantity !== undefined) {
      body.quantity = Number(body.quantity);
    }

    const validation = validateDonationPayload(body, { isPartial: false });
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        fields: validation.errors
      });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const donation = await Donation.create({
      ...body,
      donorId: req.user.id,
      imageUrl
    });

    res.status(201).json(donation);
  } catch (err) {
    next(err);
  }
}


export async function updateDonation(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid donation id" });
    }

    const validation = validateDonationPayload(req.body, { isPartial: true });
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        fields: validation.errors
      });
    }

    const updated = await Donation.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).lean();

    if (!updated) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}


// DELETE /api/donations/:id
export async function deleteDonation(req, res, next) {
  try {
    const { id } = req.params;

    const deleted = await Donation.findByIdAndDelete(id).lean();

    if (!deleted) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
