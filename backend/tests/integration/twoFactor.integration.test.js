import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { createTestApp, clearCollections, createTestUser, createAdminUser } from "../helpers/testApp.js";
import User from "../../models/user.model.js";

process.env.JWT_SECRET = "test-jwt-secret-for-integration-tests";
process.env.SUPER_ADMIN_EMAIL = "superadmin@placementmentor.com";

describe("Two-Factor Authentication Integration Tests", () => {
  let app;
  let mongoServer;
  let adminUser;
  let regularUser;
  let adminCookies;
  let userCookies;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = createTestApp();
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }, 30000);

  beforeEach(async () => {
    await clearCollections();
    adminUser = await createAdminUser(User, {
      email: "admin2fa@example.com",
      role: "admin",
    });
    regularUser = await createTestUser(User, {
      email: "user2fa@example.com",
      role: "user",
    });

    const adminLogin = await request(app)
      .post("/api/auth/signin")
      .send({ email: "admin2fa@example.com", password: "AdminPass123!" });
    adminCookies = adminLogin.headers["set-cookie"];

    const userLogin = await request(app)
      .post("/api/auth/signin")
      .send({ email: "user2fa@example.com", password: "TestPass123!" });
    userCookies = userLogin.headers["set-cookie"];
  });

  /* ================= 2FA STATUS ================= */
  describe("GET /api/auth/2fa/status", () => {
    it("returns 2FA status for privileged user", async () => {
      const res = await request(app)
        .get("/api/auth/2fa/status")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.enabled).toBe(false);
      expect(res.body.data.role).toBeDefined();
    });

    it("rejects non-privileged user", async () => {
      const res = await request(app)
        .get("/api/auth/2fa/status")
        .set("Cookie", userCookies);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/only available for privileged/);
    });
  });

  /* ================= 2FA SETUP ================= */
  describe("POST /api/auth/2fa/setup", () => {
    it("generates QR code for privileged user", async () => {
      const res = await request(app)
        .post("/api/auth/2fa/setup")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.qrCode).toBeDefined();
      expect(res.body.data.manualKey).toBeDefined();

      const updated = await User.findById(adminUser._id);
      expect(updated.twoFactorTempSecret).toBeTruthy();
    });

    it("rejects non-privileged user", async () => {
      const res = await request(app)
        .post("/api/auth/2fa/setup")
        .set("Cookie", userCookies);

      expect(res.status).toBe(403);
    });
  });

  /* ================= 2FA ENABLE ================= */
  describe("POST /api/auth/2fa/enable", () => {
    it("requires setup before enable", async () => {
      const res = await request(app)
        .post("/api/auth/2fa/enable")
        .set("Cookie", adminCookies)
        .send({ token: "123456" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Please setup 2FA first/);
    });

    it("rejects invalid OTP during enable", async () => {
      // First setup
      await request(app)
        .post("/api/auth/2fa/setup")
        .set("Cookie", adminCookies);

      const res = await request(app)
        .post("/api/auth/2fa/enable")
        .set("Cookie", adminCookies)
        .send({ token: "000000" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid OTP code/);
    });
  });

  /* ================= 2FA VERIFY LOGIN ================= */
  describe("POST /api/auth/2fa/login", () => {
    it("rejects missing temp token", async () => {
      const res = await request(app)
        .post("/api/auth/2fa/login")
        .send({ token: "123456" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Temp token and OTP are required/);
    });

    it("rejects missing OTP", async () => {
      const res = await request(app)
        .post("/api/auth/2fa/login")
        .send({ tempAuthToken: "some_token" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Temp token and OTP are required/);
    });

    it("rejects invalid temp token", async () => {
      const res = await request(app)
        .post("/api/auth/2fa/login")
        .send({ tempAuthToken: "invalid_token", token: "123456" });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Invalid or expired temp token/);
    });
  });

  /* ================= 2FA DISABLE ================= */
  describe("POST /api/auth/2fa/disable", () => {
    it("requires both password and token", async () => {
      const res = await request(app)
        .post("/api/auth/2fa/disable")
        .set("Cookie", adminCookies)
        .send({ password: "AdminPass123!" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Password and OTP are required/);
    });

    it("rejects wrong password", async () => {
      // Enable 2FA first by mocking
      await User.findByIdAndUpdate(adminUser._id, {
        twoFactorEnabled: true,
        twoFactorSecret: "JBSWY3DPEHPK3PXP",
      });

      const res = await request(app)
        .post("/api/auth/2fa/disable")
        .set("Cookie", adminCookies)
        .send({ password: "WrongPass123!", token: "123456" });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Invalid password/);
    });

    it("rejects non-privileged user", async () => {
      const res = await request(app)
        .post("/api/auth/2fa/disable")
        .set("Cookie", userCookies)
        .send({ password: "TestPass123!", token: "123456" });

      expect(res.status).toBe(403);
    });
  });
});
