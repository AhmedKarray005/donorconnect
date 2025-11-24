import request from "supertest";
import app from "../src/app.js";
import { describe, it, expect } from "vitest";

describe("Donations API", () => {
  it("GET /api/donations should return an array", async () => {
    const res = await request(app).get("/api/donations");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // optional: expect at least 1 donation from seed data
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("POST /api/donations should create a donation", async () => {
    const newDonation = {
      title: "Test Jacket",
      description: "Test description",
      category: "Clothes",
      quantity: 1,
      condition: "Good",
      pickupLocation: "Paris 75001",
      availableDate: "2025-12-10",
      status: "Open",
      donorId: 999,
    };

    const res = await request(app).post("/api/donations").send(newDonation);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe(newDonation.title);
  });

  it("GET /api/donations/:id should return a single donation", async () => {
    // First create a donation
    const createRes = await request(app).post("/api/donations").send({
      title: "For GET by ID",
      category: "Food",
      quantity: 3,
      pickupLocation: "Paris 75002",
      availableDate: "2025-12-11",
    });

    const createdId = createRes.body.id;

    // Now retrieve it
    const res = await request(app).get(`/api/donations/${createdId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", createdId);
  });

  it("PUT /api/donations/:id should update a donation", async () => {
    // Create donation to update
    const createRes = await request(app).post("/api/donations").send({
      title: "To be updated",
      category: "Books",
      quantity: 5,
      pickupLocation: "Paris 75003",
      availableDate: "2025-12-12",
    });

    const createdId = createRes.body.id;

    const res = await request(app)
      .put(`/api/donations/${createdId}`)
      .send({ title: "Updated title" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated title");
  });

  it("DELETE /api/donations/:id should delete a donation", async () => {
    // Create donation to delete
    const createRes = await request(app).post("/api/donations").send({
      title: "To be deleted",
      category: "Misc",
      quantity: 1,
      pickupLocation: "Paris 75004",
      availableDate: "2025-12-13",
    });

    const createdId = createRes.body.id;

    // Delete it
    const deleteRes = await request(app).delete(`/api/donations/${createdId}`);
    expect(deleteRes.status).toBe(204);

    // Verify deletion
    const getRes = await request(app).get(`/api/donations/${createdId}`);
    expect(getRes.status).toBe(404);
  });
});
