import express from "express";
import donationsRouter from "./routes/donations.routes.js";
import usersRouter from "./routes/users.routes.js";
import authRouter from "./routes/auth.routes.js";
import requestsRouter from "./routes/requests.routes.js";
import cors from "cors";                  // <--- ADD THIS LINE
import path from "path";
import { fileURLToPath } from "url";
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);
app.post("/debug", (req, res) => {
  console.log("DEBUG /debug body:", req.body);
  res.json({ ok: true, body: req.body });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/donations", donationsRouter);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/requests", requestsRouter);

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid id format" });
  }

  res.status(500).json({ error: "Internal server error" });
});

export default app;
