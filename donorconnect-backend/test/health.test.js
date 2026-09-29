/**
 * Integration test for the current API health route.
 */
import request from "supertest";
import app from "../src/app.js";
import { describe, it, expect } from "vitest";

describe("GET /api/health", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
