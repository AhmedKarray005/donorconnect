import express from "express";

const router = express.Router();

// In-memory pickup requests
let requests = [
  {
    id: 1,
    donationId: 1,
    npoId: 2, // example NPO user id
    message: "We would like to collect these items next week.",
    status: "pending", // pending | accepted | rejected
    requestDate: "2025-11-24",
    pickupDate: "2025-11-30",
    pickupTime: "10:00",
  },
];

// Helper to generate next id
function nextId() {
  return requests.length === 0 ? 1 : Math.max(...requests.map((r) => r.id)) + 1;
}

// GET /api/requests  -> list all pickup requests
router.get("/", (req, res) => {
  res.status(200).json(requests);
});

// GET /api/requests/:id  -> get request by id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const reqObj = requests.find((r) => r.id === id);

  if (!reqObj) {
    return res.status(404).json({ error: "Request not found" });
  }

  res.status(200).json(reqObj);
});

// POST /api/requests  -> create new pickup request
router.post("/", (req, res) => {
  const {
    donationId,
    npoId,
    message,
    status,
    requestDate,
    pickupDate,
    pickupTime,
  } = req.body;

  if (!donationId || !npoId) {
    return res.status(400).json({
      error: "Missing required fields: donationId, npoId",
    });
  }

  const newRequest = {
    id: nextId(),
    donationId,
    npoId,
    message: message || "",
    status: status || "pending",
    requestDate: requestDate || new Date().toISOString().slice(0, 10),
    pickupDate: pickupDate || null,
    pickupTime: pickupTime || null,
  };

  requests.push(newRequest);
  res.status(201).json(newRequest);
});

// PUT /api/requests/:id  -> update request
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = requests.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Request not found" });
  }

  requests[index] = {
    ...requests[index],
    ...req.body,
    id, // ensure id unchanged
  };

  res.status(200).json(requests[index]);
});

// DELETE /api/requests/:id  -> delete request
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = requests.length;

  requests = requests.filter((r) => r.id !== id);

  if (requests.length === before) {
    return res.status(404).json({ error: "Request not found" });
  }

  res.status(204).end();
});

export default router;
