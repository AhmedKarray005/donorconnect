import express from "express";
const router = express.Router();

let users = [
  { id: 1, name: "John Doe", email: "john@gmail.com", role: "donor" },
  { id: 2, name: "HelpingHands", email: "help@gmail.com", role: "npo" },
];

// Generate numeric id
function nextId() {
  return users.length === 0 ? 1 : Math.max(...users.map((u) => u.id)) + 1;
}

// GET all users
router.get("/", (req, res) => {
  res.json(users);
});

// GET by id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// POST create user
router.post("/", (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role)
    return res.status(400).json({ error: "Missing name, email or role" });

  const newUser = { id: nextId(), name, email, role };
  users.push(newUser);

  res.status(201).json(newUser);
});

// PUT update user
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) return res.status(404).json({ error: "User not found" });

  users[index] = { ...users[index], ...req.body, id };
  res.json(users[index]);
});

// DELETE user
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = users.length;

  users = users.filter((u) => u.id !== id);

  if (users.length === before)
    return res.status(404).json({ error: "User not found" });

  res.status(204).end();
});

export default router;
