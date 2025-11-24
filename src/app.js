import express from "express";
import donationsRouter from "./routes/donations.routes.js";
import usersRouter from "./routes/users.routes.js";
import requestsRouter from "./routes/requests.routes.js";

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/donations", donationsRouter);
app.use("/api/users", usersRouter);
app.use("/api/requests", requestsRouter);

// Global error handler (Lab requirement)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
