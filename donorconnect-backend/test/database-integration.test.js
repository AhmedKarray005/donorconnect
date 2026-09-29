import { randomBytes, randomUUID } from "node:crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import app from "../src/app.js";
import User from "../src/models/user.model.js";

// Only CI's explicit, disposable local service is used. Never use MONGO_URI or .env.
const testUri = process.env.TEST_MONGO_URI;
const database = "donorconnect_test_" + randomUUID().replaceAll("-", "");

describe.skipIf(!testUri)("API with isolated MongoDB", () => {
  beforeAll(async () => {
    const parsed = new URL(testUri);
    if (parsed.protocol !== "mongodb:" || !["127.0.0.1", "localhost"].includes(parsed.hostname)) {
      throw new Error("TEST_MONGO_URI must reference an isolated loopback MongoDB service");
    }
    vi.stubEnv("JWT_SECRET", randomBytes(32).toString("hex"));
    vi.stubEnv("ENABLE_ADMIN_BOOTSTRAP", "false");
    await mongoose.connect(testUri, { dbName: database, serverSelectionTimeoutMS: 10000 });
  }, 15000);

  afterAll(async () => {
    if (mongoose.connection.readyState === 1 && mongoose.connection.name === database) {
      // This randomly named database was created by this test run only.
      await mongoose.connection.dropDatabase();
    }
    await mongoose.disconnect();
    vi.unstubAllEnvs();
  });

  async function registerAndLogin(email) {
    const password = "integration-test-password";
    const registered = await request(app).post("/api/auth/register").send({
      name: "Synthetic donor", email, password, address: "Synthetic address"
    });
    expect(registered.status).toBe(201);
    const login = await request(app).post("/api/auth/login").send({ email, password });
    expect(login.status).toBe(200);
    return "Bearer " + login.body.token;
  }

  it("persists registration data and enforces donation deletion ownership", async () => {
    const owner = await registerAndLogin("owner@example.test");
    const other = await registerAndLogin("other@example.test");
    const me = await request(app).get("/api/auth/me").set("Authorization", owner);
    expect(me.status).toBe(200);
    expect(me.body.address).toBe("Synthetic address");
    expect(me.body.password).toBeUndefined();

    const created = await request(app).post("/api/donations").set("Authorization", owner).send({
      title: "Synthetic donation", category: "books", quantity: 1,
      pickupLocation: "Synthetic location", availableDate: "2027-01-01"
    });
    expect(created.status).toBe(201);
    const path = "/api/donations/" + created.body._id;
    expect((await request(app).delete(path).set("Authorization", other)).status).toBe(404);
    expect((await request(app).get(path)).status).toBe(200);
    expect((await request(app).delete(path).set("Authorization", owner)).status).toBe(204);
    expect((await request(app).get(path)).status).toBe(404);
  });

  it("creates login-compatible hashed passwords through the admin endpoint", async () => {
    const password = "integration-test-password";
    await User.create({
      name: "Synthetic admin", email: "admin@example.test", role: "admin",
      password: await bcrypt.hash(password, 10)
    });
    const adminLogin = await request(app).post("/api/auth/login").send({ email: "admin@example.test", password });
    expect(adminLogin.status).toBe(200);
    const created = await request(app).post("/api/users")
      .set("Authorization", "Bearer " + adminLogin.body.token)
      .send({ name: "Created user", email: "created@example.test", password });
    expect(created.status).toBe(201);
    const saved = await User.findOne({ email: "created@example.test" });
    expect(saved.password).not.toBe(password);
    expect(await bcrypt.compare(password, saved.password)).toBe(true);
    expect((await request(app).post("/api/auth/login")
      .send({ email: "created@example.test", password })).status).toBe(200);
  });
});
