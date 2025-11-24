import { Router } from "express";

const router = Router();

// placeholder
router.get("/", (req, res) => {
  res.json({ message: "DonorConnect API root" });
});

export default router;
