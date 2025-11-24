import request from "supertest";
import app from "../src/app.js";
import { describe, it, expect } from "vitest";

describe("Pickup Requests API", () => {
  it("GET /api/requests returns array", async () => {
    const res = await request(app).get("/api/requests");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/requests creates a request", async () => {
    const res = await request(app).post("/api/requests").send({
      donationId: 1,
      npoId: 2,
      message: "We would like to pick this up tomorrow",
      pickupDate: "2025-12-01",
      pickupTime: "15:00",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.donationId).toBe(1);
  });

  it("GET /api/requests/:id returns a single request", async () => {
    const createRes = await request(app).post("/api/requests").send({
      donationId: 2,
      npoId: 3,
      message: "For get by ID test",
    });

    const id = createRes.body.id;

    const res = await request(app).get(`/api/requests/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", id);
  });

  it("PUT /api/requests/:id updates a request", async () => {
    const createRes = await request(app).post("/api/requests").send({
      donationId: 3,
      npoId: 4,
      message: "To be updated",
    });

    const id = createRes.body.id;

    const res = await request(app)
      .put(`/api/requests/${id}`)
      .send({ status: "accepted" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("accepted");
  });

  it("DELETE /api/requests/:id deletes a request", async () => {
    const createRes = await request(app).post("/api/requests").send({
      donationId: 4,
      npoId: 5,
      message: "To be deleted",
    });

    const id = createRes.body.id;

    const del = await request(app).delete(`/api/requests/${id}`);
    expect(del.status).toBe(204);

    const getRes = await request(app).get(`/api/requests/${id}`);
    expect(getRes.status).toBe(404);
  });
});
