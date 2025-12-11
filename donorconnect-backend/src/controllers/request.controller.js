// src/controllers/request.controller.js
import mongoose from "mongoose";
import Request from "../models/request.model.js";
import Donation from "../models/donation.model.js";
import { validateRequestPayload } from "../validation/request.validation.js";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// listRequests: NPO sees its own; donor sees requests on his donations; admin sees all
export async function listRequests(req, res, next) {
  try {
    let filter = {};

    if (req.user.role === "npo") {
      filter.requester = req.user.id;
    } else if (req.user.role === "donor") {
      // requests for donations owned by this donor
      const myDonations = await Donation.find({ donorId: req.user.id })
        .select("_id")
        .lean();
      const ids = myDonations.map((d) => d._id);
      filter.donation = { $in: ids };
    } // admin: no extra filter

    const requests = await Request.find(filter)
      .populate("donation", "title category pickupLocation")
      .populate("requester", "name email role")
      .lean();

    res.status(200).json(requests);
  } catch (err) {
    next(err);
  }
}

// GET /api/requests/:id
export async function getRequest(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const request = await Request.findById(id)
      .populate("donation", "title category pickupLocation")
      .populate("requester", "name email role")
      .lean();

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // non-admin can only access their own
    if (req.user.role !== "admin" && request.requester._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.status(200).json(request);
  } catch (err) {
    next(err);
  }
}

// POST /api/requests
// any authenticated user can create a request
// POST /api/requests  – only NPO can create
// POST /api/requests  – ONLY NPO can create
export async function createRequest(req, res, next) {
  try {
    if (req.user.role !== "npo") {
      return res.status(403).json({ error: "Only NPOs can create requests" });
    }

    const validation = validateRequestPayload(req.body, { isPartial: false });
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        fields: validation.errors
      });
    }

    const { donationId, message, scheduledDate } = req.body;

    const donation = await Donation.findById(donationId).lean();
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    // Donation must be Open
    if (donation.status !== "Open") {
      return res
        .status(400)
        .json({ error: "Cannot request pickup for a non-Open donation" });
    }

    // Date constraints
    const scheduled = new Date(scheduledDate);
    const available = new Date(donation.availableDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(scheduled.getTime())) {
      return res
        .status(400)
        .json({ error: "scheduledDate must be a valid date" });
    }

    if (scheduled < today) {
      return res
        .status(400)
        .json({ error: "Pickup date cannot be in the past" });
    }

    if (scheduled < available) {
      return res.status(400).json({
        error:
          "Pickup date cannot be before the donation available date"
      });
    }

    const request = await Request.create({
      donation: donationId,
      requester: req.user.id,
      message: message.trim(),
      scheduledDate: scheduled
    });

    const populated = await Request.findById(request._id)
      .populate("donation", "title category pickupLocation imageUrl availableDate")
      .populate("requester", "name email role")
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}


// PUT /api/requests/:id
// requester can update their own (message/scheduledDate), admin can update everything
export async function updateRequest(req, res, next) {
    const validation = validateRequestPayload(req.body, { isPartial: true });

if (!validation.isValid) {
  return res.status(400).json({
    error: "Validation failed",
    fields: validation.errors
  });
}

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const existing = await Request.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (req.user.role !== "admin" && existing.requester.toString() !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updates = { ...req.body };

    // non-admin cannot directly change requester/donation
    if (req.user.role !== "admin") {
      delete updates.requester;
      delete updates.donation;
      // they can still change message, scheduledDate, maybe status (optional)
    }

    const updated = await Request.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .populate("donation", "title category pickupLocation")
      .populate("requester", "name email role")
      .lean();

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/requests/:id
// requester or admin
export async function deleteRequest(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const existing = await Request.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (req.user.role !== "admin" && existing.requester.toString() !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await Request.findByIdAndDelete(id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
// PATCH /api/requests/:id/accept   (donor only)
export async function acceptRequest(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const request = await Request.findById(id).populate("donation");
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // only the donor owning the donation can accept
    if (
      req.user.role !== "donor" ||
      request.donation.donorId.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    request.status = "accepted";
    await request.save();

    res.status(200).json(request);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/requests/:id/reject   (donor only)
export async function rejectRequest(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const request = await Request.findById(id).populate("donation");
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (
      req.user.role !== "donor" ||
      request.donation.donorId.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json(request);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/requests/:id/cancel   (npo only)
export async function cancelRequest(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (
      req.user.role !== "npo" ||
      request.requester.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    request.status = "cancelled";
    await request.save();

    res.status(200).json(request);
  } catch (err) {
    next(err);
  }
}

