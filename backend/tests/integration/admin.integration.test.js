import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { createTestApp, clearCollections, createTestUser, createAdminUser } from "../helpers/testApp.js";
import User from "../../models/user.model.js";
import Settings from "../../models/Settings.model.js";

process.env.JWT_SECRET = "test-jwt-secret-for-integration-tests";
process.env.SUPER_ADMIN_EMAIL = "superadmin@placementmentor.com";

describe("Admin Integration Tests", () => {
  let app;
  let mongoServer;
  let admin;
  let user;
  let adminCookies;
  let userCookies;
  let superAdmin;
  let superAdminCookies;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = createTestApp();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await clearCollections();
    user = await createTestUser(User);
    admin = await createAdminUser(User);

    superAdmin = await createAdminUser(User, {
      email: "superadmin@placementmentor.com",
      fullName: "Super Admin",
      role: "superadmin",
    });

    const adminLogin = await request(app)
      .post("/api/auth/signin")
      .send({ email: "admin@example.com", password: "AdminPass123!" });
    adminCookies = adminLogin.headers["set-cookie"];

    const userLogin = await request(app)
      .post("/api/auth/signin")
      .send({ email: "test@example.com", password: "TestPass123!" });
    userCookies = userLogin.headers["set-cookie"];

    const superLogin = await request(app)
      .post("/api/auth/signin")
      .send({ email: "superadmin@placementmentor.com", password: "AdminPass123!" });
    superAdminCookies = superLogin.headers["set-cookie"];
  });

  /* ================= GET ALL USERS ================= */
  describe("GET /api/admin/users", () => {
    it("admin can list all users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it("non-admin cannot list users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Cookie", userCookies);

      expect(res.status).toBe(403);
    });

    it("unauthenticated cannot list users", async () => {
      const res = await request(app).get("/api/admin/users");
      expect(res.status).toBe(401);
    });
  });

  /* ================= BAN USER ================= */
  describe("PATCH /api/admin/users/:id/ban", () => {
    it("admin can ban a regular user", async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${user._id}/ban`)
        .set("Cookie", adminCookies)
        .send({ banReason: "Spam behavior" });

      expect(res.status).toBe(200);
      expect(res.body.data.isBanned).toBe(true);
      expect(res.body.data.banReason).toBe("Spam behavior");

      const updated = await User.findById(user._id);
      expect(updated.isBanned).toBe(true);
      expect(updated.banHistory).toHaveLength(1);
    });

    it("prevents self-ban", async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${admin._id}/ban`)
        .set("Cookie", adminCookies)
        .send({ banReason: "Test" });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Cannot ban yourself/);
    });

    it("blocks non-admin from banning", async () => {
      const otherUser = await createTestUser(User, { email: "other@example.com" });

      const res = await request(app)
        .patch(`/api/admin/users/${otherUser._id}/ban`)
        .set("Cookie", userCookies)
        .send({ banReason: "Test" });

      expect(res.status).toBe(403);
    });
  });

  /* ================= UNBAN USER ================= */
  describe("PATCH /api/admin/users/:id/unban", () => {
    it("admin can unban a user", async () => {
      await User.findByIdAndUpdate(user._id, {
        isBanned: true,
        banReason: "Spam",
      });

      const res = await request(app)
        .patch(`/api/admin/users/${user._id}/unban`)
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.isBanned).toBe(false);
      expect(res.body.data.banReason).toBe("");
    });
  });

  /* ================= PROMOTE/DEMOTE ================= */
  describe("PATCH /api/admin/promote/:id", () => {
    it("superadmin can promote user to admin", async () => {
      const res = await request(app)
        .patch(`/api/admin/promote/${user._id}`)
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe("admin");
    });

    it("regular admin cannot promote users", async () => {
      const res = await request(app)
        .patch(`/api/admin/promote/${user._id}`)
        .set("Cookie", adminCookies);

      expect(res.status).toBe(403);
    });

    it("protects superadmin from demotion", async () => {
      const res = await request(app)
        .patch(`/api/admin/demote/${superAdmin._id}`)
        .set("Cookie", superAdminCookies);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Cannot demote super admin/);
    });
  });

  /* ================= SETTINGS ================= */
  describe("GET /api/admin/settings", () => {
    it("admin can get settings", async () => {
      const res = await request(app)
        .get("/api/admin/settings")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });
  });

  describe("PUT /api/admin/settings", () => {
    it("admin can update maintenance mode", async () => {
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", adminCookies)
        .send({ maintenanceMode: true });

      expect(res.status).toBe(200);
      expect(res.body.data.maintenanceMode).toBe(true);
    });

    it("rejects invalid maintenanceMode type", async () => {
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", adminCookies)
        .send({ maintenanceMode: "yes" });

      expect(res.status).toBe(400);
    });

    it("rejects invalid announcementType", async () => {
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Cookie", adminCookies)
        .send({ announcementType: "invalid" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/admin/public-settings", () => {
    it("returns public settings without auth", async () => {
      const res = await request(app).get("/api/admin/public-settings");
      expect(res.status).toBe(200);
      expect(res.body.data.maintenanceMode).toBeDefined();
    });
  });

  /* ================= ANALYTICS ================= */
  describe("GET /api/admin/analytics", () => {
    it("admin can view dashboard analytics", async () => {
      const res = await request(app)
        .get("/api/admin/analytics")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.userMetrics).toBeDefined();
      expect(res.body.data.potdAnalytics).toBeDefined();
      expect(res.body.data.leaderboard).toBeDefined();
    });

    it("non-admin blocked from analytics", async () => {
      const res = await request(app)
        .get("/api/admin/analytics")
        .set("Cookie", userCookies);

      expect(res.status).toBe(403);
    });
  });
});
