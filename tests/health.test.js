import request from "supertest";
import app from "../src/app.js";
import { describe, it, expect } from "vitest";

describe("Health check API", () => {
  it("GET /api/health should return status ok", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
