import express from "express";
import donationsRouter from "./routes/donations.routes.js";
import usersRouter from "./routes/users.routes.js";
import requestsRouter from "./routes/requests.routes.js";

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// existing
app.use("/api/donations", donationsRouter);
app.use("/api/users", usersRouter);

// new
app.use("/api/requests", requestsRouter);

export default app;
