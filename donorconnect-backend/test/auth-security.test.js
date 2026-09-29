import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/models/user.model.js", () => ({
  default: {
    findOne: vi.fn(), create: vi.fn(), findByIdAndUpdate: vi.fn()
  }
}));
vi.mock("../src/models/donation.model.js", () => ({
  default: { findOneAndDelete: vi.fn() }
}));

import app from "../src/app.js";
import User from "../src/models/user.model.js";
import Donation from "../src/models/donation.model.js";
import { getJwtSecret } from "../src/config/auth.js";

const owner = "111111111111111111111111";
const other = "222222222222222222222222";
const donationId = "333333333333333333333333";

function bearer(role = "donor", id = owner) {
  return "Bearer " + jwt.sign({ id, role }, getJwtSecret(), { expiresIn: "1h" });
}

beforeEach(() => {
  vi.resetAllMocks();
  // Ephemeral test material, not a deployed credential or environment-file edit.
  vi.stubEnv("JWT_SECRET", randomBytes(32).toString("hex"));
  vi.stubEnv("ENABLE_ADMIN_BOOTSTRAP", "false");
  User.findOne.mockReturnValue({ lean: async () => null });
  User.create.mockImplementation(async (payload) => ({ toObject: () => ({ ...payload }) }));
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("authentication configuration", () => {
  it("rejects missing configuration before trying to connect to MongoDB", () => {
    const child = spawnSync(process.execPath, ["src/index.js"], {
      encoding: "utf8", timeout: 5000,
      env: { ...process.env, JWT_SECRET: "", MONGO_URI: "mongodb://127.0.0.1:1/synthetic" }
    });
    expect(child.status).toBe(1);
    expect(child.stderr).toContain("JWT_SECRET must be configured");
  });
  it.each(["", "   ", "dev-secret"])("rejects unsafe configuration %j", (value) => {
    vi.stubEnv("JWT_SECRET", value);
    expect(getJwtSecret).toThrow("JWT_SECRET must be configured");
  });

  it("reads the configured signing key after module import", async () => {
    const password = "test-password-only";
    User.findOne.mockResolvedValueOnce({
      _id: owner, role: "donor", email: "donor@example.test",
      password: await bcrypt.hash(password, 10)
    });
    const response = await request(app).post("/api/auth/login")
      .send({ email: "donor@example.test", password });
    expect(response.status).toBe(200);
    expect(jwt.verify(response.body.token, getJwtSecret()).id).toBe(owner);
  });

  it("rejects a token signed with a different key", async () => {
    const token = jwt.sign({ id: owner, role: "donor" }, randomBytes(32).toString("hex"));
    const response = await request(app).delete(`/api/donations/${donationId}`)
      .set("Authorization", "Bearer " + token);
    expect(response.status).toBe(403);
    expect(Donation.findOneAndDelete).not.toHaveBeenCalled();
  });
});

describe("registration and administrative user management", () => {
  it("rejects public admin registration before database access", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test admin", email: "admin@example.test", password: "test-password-only", role: "admin"
    });
    expect(response.status).toBe(400);
    expect(response.body.fields.role).toBeDefined();
    expect(User.findOne).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
  });

  it("stores a donor's profile fields and a hashed password", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test donor", email: "donor@example.test", password: "test-password-only",
      address: "Synthetic test address", isActive: false
    });
    expect(response.status).toBe(201);
    const stored = User.create.mock.calls[0][0];
    expect(stored.role).toBe("donor");
    expect(stored.address).toBe("Synthetic test address");
    expect(stored.isActive).toBeUndefined();
    expect(await bcrypt.compare("test-password-only", stored.password)).toBe(true);
    expect(response.body.password).toBeUndefined();
  });

  it("stores nonprofit profile fields", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test NPO", email: "npo@example.test", password: "test-password-only", role: "npo",
      organizationName: "Test organization", mission: "Synthetic data", city: "Test city"
    });
    expect(response.status).toBe(201);
    expect(User.create.mock.calls[0][0]).toMatchObject({
      role: "npo", organizationName: "Test organization", mission: "Synthetic data", city: "Test city"
    });
  });

  it("hashes passwords created through the authenticated admin endpoint", async () => {
    const response = await request(app).post("/api/users").set("Authorization", bearer("admin"))
      .send({ name: "Test donor", email: "new@example.test", password: "test-password-only" });
    expect(response.status).toBe(201);
    const stored = User.create.mock.calls[0][0];
    expect(stored.password).not.toBe("test-password-only");
    expect(await bcrypt.compare("test-password-only", stored.password)).toBe(true);
    expect(response.body.password).toBeUndefined();
  });

  it("does not let a donor use the admin creation endpoint", async () => {
    const response = await request(app).post("/api/users").set("Authorization", bearer())
      .send({ name: "Test", email: "test@example.test", password: "test-password-only" });
    expect(response.status).toBe(403);
    expect(User.create).not.toHaveBeenCalled();
  });

  it("validates updates and excludes password and database operators", async () => {
    User.findByIdAndUpdate.mockReturnValue({
      select: () => ({ lean: async () => ({ name: "Updated name" }) })
    });
    const response = await request(app).put(`/api/users/${other}`)
      .set("Authorization", bearer("admin"))
      .send({ name: "Updated name", password: "do-not-store", $set: { password: "do-not-store" } });
    expect(response.status).toBe(200);
    expect(User.findByIdAndUpdate.mock.calls[0][1]).toEqual({ name: "Updated name" });
  });

  it("rejects invalid email updates without calling the model", async () => {
    const response = await request(app).put(`/api/users/${other}`)
      .set("Authorization", bearer("admin")).send({ email: "invalid" });
    expect(response.status).toBe(400);
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("disables first-admin bootstrap by default", async () => {
    const response = await request(app).post("/api/users/init-admin")
      .send({ name: "Test", email: "admin@example.test", password: "test-password-only" });
    expect(response.status).toBe(403);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it("keeps the existing-admin guard when bootstrap is explicitly enabled", async () => {
    vi.stubEnv("ENABLE_ADMIN_BOOTSTRAP", "true");
    User.findOne.mockResolvedValueOnce({ _id: owner, role: "admin" });
    const response = await request(app).post("/api/users/init-admin")
      .send({ name: "Test", email: "admin@example.test", password: "test-password-only" });
    expect(response.status).toBe(403);
    expect(User.create).not.toHaveBeenCalled();
  });

  it("allows an explicitly enabled first-admin bootstrap", async () => {
    vi.stubEnv("ENABLE_ADMIN_BOOTSTRAP", "true");
    User.findOne.mockResolvedValueOnce(null);
    const response = await request(app).post("/api/users/init-admin")
      .send({ name: "Test", email: "admin@example.test", password: "test-password-only" });
    expect(response.status).toBe(201);
    expect(User.create.mock.calls[0][0].role).toBe("admin");
    expect(response.body.user.password).toBeUndefined();
  });
});

describe("donation deletion ownership", () => {
  it("requires authentication before deletion", async () => {
    const response = await request(app).delete(`/api/donations/${donationId}`);
    expect(response.status).toBe(401);
    expect(Donation.findOneAndDelete).not.toHaveBeenCalled();
  });

  it("leaves another donor's record intact and allows its owner to delete it", async () => {
    const records = [{ _id: donationId, donorId: owner }];
    Donation.findOneAndDelete.mockImplementation((filter) => ({
      lean: async () => {
        const index = records.findIndex(record => Object.entries(filter)
          .every(([key, value]) => record[key] === value));
        return index === -1 ? null : records.splice(index, 1)[0];
      }
    }));
    const forbidden = await request(app).delete(`/api/donations/${donationId}`)
      .set("Authorization", bearer("donor", other));
    expect(forbidden.status).toBe(404);
    expect(records).toHaveLength(1);
    const allowed = await request(app).delete(`/api/donations/${donationId}`)
      .set("Authorization", bearer("donor", owner));
    expect(allowed.status).toBe(204);
    expect(records).toHaveLength(0);
  });
});

describe("current HTTP contract", () => {
  it("rejects incomplete login input", async () => {
    const response = await request(app).post("/api/auth/login").send({});
    expect(response.status).toBe(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it("returns 404 for a route that is not in the application", async () => {
    expect((await request(app).get("/api/not-a-route")).status).toBe(404);
  });
});
