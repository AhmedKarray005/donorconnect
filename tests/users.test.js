import request from "supertest";
import app from "../src/app.js";
import { describe, it, expect } from "vitest";

describe("Users API", () => {
  it("GET /api/users returns array", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/users creates user", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Test User", email: "test@mail.com", role: "donor" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("PUT /api/users/:id updates user", async () => {
    const create = await request(app)
      .post("/api/users")
      .send({ name: "Old", email: "old@mail.com", role: "donor" });

    const id = create.body.id;

    const update = await request(app)
      .put(`/api/users/${id}`)
      .send({ name: "Updated" });

    expect(update.status).toBe(200);
    expect(update.body.name).toBe("Updated");
  });

  it("DELETE /api/users/:id deletes user", async () => {
    const create = await request(app)
      .post("/api/users")
      .send({ name: "To Delete", email: "del@mail.com", role: "npo" });

    const id = create.body.id;

    const del = await request(app).delete(`/api/users/${id}`);
    expect(del.status).toBe(204);
  });
});
