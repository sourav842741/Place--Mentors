import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { createTestApp, clearCollections, createTestUser, createAdminUser } from "../helpers/testApp.js";
import User from "../../models/user.model.js";
import TempUser from "../../models/tempUser.model.js";

process.env.JWT_SECRET = "test-jwt-secret-for-integration-tests";
process.env.SUPER_ADMIN_EMAIL = "superadmin@placementmentor.com";

describe("Auth Integration Tests", () => {
  let app;
  let mongoServer;
  let testUser;
  let adminUser;

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
    testUser = await createTestUser(User);
    adminUser = await createAdminUser(User);
  });

  /* ================= SIGNUP OTP ================= */
  describe("POST /api/auth/signup/send-otp", () => {
    it("sends OTP for new user signup", async () => {
      const res = await request(app)
        .post("/api/auth/signup/send-otp")
        .send({
          fullName: "New User",
          email: "newuser@example.com",
          password: "SecurePass123!",
          skills: ["React", "Node.js"],
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("OTP sent to email");

      const tempUser = await TempUser.findOne({ email: "newuser@example.com" });
      expect(tempUser).toBeTruthy();
      expect(tempUser.otp).toMatch(/^\d{4}$/);
    });

    it("rejects duplicate email", async () => {
      const res = await request(app)
        .post("/api/auth/signup/send-otp")
        .send({
          fullName: "Duplicate",
          email: "test@example.com",
          password: "SecurePass123!",
          skills: ["React"],
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/);
    });

    it("rejects invalid email format", async () => {
      const res = await request(app)
        .post("/api/auth/signup/send-otp")
        .send({
          fullName: "Bad Email",
          email: "not-an-email",
          password: "SecurePass123!",
          skills: ["React"],
        });

      expect(res.status).toBe(400);
    });

    it("rejects short password", async () => {
      const res = await request(app)
        .post("/api/auth/signup/send-otp")
        .send({
          fullName: "Short Pass",
          email: "short@example.com",
          password: "123",
          skills: ["React"],
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/at least 6/);
    });

    it("rejects empty skills array", async () => {
      const res = await request(app)
        .post("/api/auth/signup/send-otp")
        .send({
          fullName: "No Skills",
          email: "noskills@example.com",
          password: "SecurePass123!",
          skills: [],
        });

      expect(res.status).toBe(400);
    });
  });

  /* ================= VERIFY OTP ================= */
  describe("POST /api/auth/signup/verify-otp", () => {
    it("creates user after valid OTP verification", async () => {
      await TempUser.create({
        fullName: "OTP User",
        email: "otpuser@example.com",
        password: "SecurePass123!",
        skills: ["React"],
        otp: "1234",
        otpExpires: Date.now() + 5 * 60 * 1000,
      });

      const res = await request(app)
        .post("/api/auth/signup/verify-otp")
        .send({ email: "otpuser@example.com", otp: "1234" });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe("otpuser@example.com");
      expect(res.body.data.xp).toBe(10); // signup XP reward

      const user = await User.findOne({ email: "otpuser@example.com" });
      expect(user).toBeTruthy();
      expect(user.streakCount).toBe(1);
    });

    it("rejects expired OTP", async () => {
      await TempUser.create({
        fullName: "Expired",
        email: "expired@example.com",
        password: "SecurePass123!",
        skills: ["React"],
        otp: "1234",
        otpExpires: Date.now() - 1000,
      });

      const res = await request(app)
        .post("/api/auth/signup/verify-otp")
        .send({ email: "expired@example.com", otp: "1234" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid or expired/);
    });

    it("rejects wrong OTP", async () => {
      await TempUser.create({
        fullName: "Wrong OTP",
        email: "wrong@example.com",
        password: "SecurePass123!",
        skills: ["React"],
        otp: "1234",
        otpExpires: Date.now() + 5 * 60 * 1000,
      });

      const res = await request(app)
        .post("/api/auth/signup/verify-otp")
        .send({ email: "wrong@example.com", otp: "9999" });

      expect(res.status).toBe(400);
    });
  });

  /* ================= LOGIN ================= */
  describe("POST /api/auth/signin", () => {
    it("logs in valid user with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/signin")
        .send({ email: "test@example.com", password: "TestPass123!" });

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("test@example.com");
      expect(res.body.data.xp).toBeDefined();
      expect(res.headers["set-cookie"]).toBeDefined();

      const cookies = res.headers["set-cookie"];
      const hasTokenCookie = cookies.some((c) => c.includes("token="));
      expect(hasTokenCookie).toBe(true);
    });

    it("rejects wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/signin")
        .send({ email: "test@example.com", password: "WrongPass!" });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Invalid credentials/);
    });

    it("rejects non-existent user", async () => {
      const res = await request(app)
        .post("/api/auth/signin")
        .send({ email: "nobody@example.com", password: "SomePass123!" });

      expect(res.status).toBe(401);
    });

    it("rejects banned user with reason", async () => {
      await User.findByIdAndUpdate(testUser._id, {
        isBanned: true,
        banReason: "Violation of terms",
      });

      const res = await request(app)
        .post("/api/auth/signin")
        .send({ email: "test@example.com", password: "TestPass123!" });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Violation of terms/);
    });

    it("rejects banned user without reason", async () => {
      await User.findByIdAndUpdate(testUser._id, {
        isBanned: true,
        banReason: "",
      });

      const res = await request(app)
        .post("/api/auth/signin")
        .send({ email: "test@example.com", password: "TestPass123!" });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/suspended/);
    });

    it("blocks invalid email format", async () => {
      const res = await request(app)
        .post("/api/auth/signin")
        .send({ email: "not-email", password: "TestPass123!" });

      expect(res.status).toBe(400);
    });
  });

  /* ================= GET CURRENT USER ================= */
  describe("GET /api/auth/me", () => {
    it("returns current user with valid token cookie", async () => {
      const loginRes = await request(app)
        .post("/api/auth/signin")
        .send({ email: "test@example.com", password: "TestPass123!" });

      const cookies = loginRes.headers["set-cookie"];

      const res = await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookies);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("test@example.com");
      expect(res.body.data.password).toBeUndefined();
    });

    it("rejects request without token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("rejects invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Cookie", ["token=invalid-token"]);

      expect(res.status).toBe(401);
    });
  });

  /* ================= LOGOUT ================= */
  describe("GET /api/auth/signout", () => {
    it("clears token cookie on logout", async () => {
      const res = await request(app).get("/api/auth/signout");

      expect(res.status).toBe(200);
      const cookies = res.headers["set-cookie"];
      if (cookies) {
        const tokenCleared = cookies.some((c) => c.includes("token=") && c.includes("Expires=Thu, 01 Jan 1970"));
        expect(tokenCleared).toBe(true);
      }
    });
  });

  /* ================= PASSWORD RESET ================= */
  describe("POST /api/auth/password/send-otp", () => {
    it("sends reset OTP for existing user", async () => {
      const res = await request(app)
        .post("/api/auth/password/send-otp")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(200);

      const user = await User.findOne({ email: "test@example.com" });
      expect(user.resetOtp).toMatch(/^\d{4}$/);
      expect(user.resetOtpExpires).toBeDefined();
    });

    it("rejects non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/password/send-otp")
        .send({ email: "nobody@example.com" });

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/auth/password/reset", () => {
    it("resets password with valid OTP", async () => {
      await User.findByIdAndUpdate(testUser._id, {
        resetOtp: "5678",
        resetOtpExpires: Date.now() + 5 * 60 * 1000,
      });

      const res = await request(app)
        .post("/api/auth/password/reset")
        .send({
          email: "test@example.com",
          otp: "5678",
          newPassword: "NewSecurePass123!",
        });

      expect(res.status).toBe(200);

      const user = await User.findOne({ email: "test@example.com" });
      const bcrypt = await import("bcryptjs");
      const isMatch = await bcrypt.default.compare("NewSecurePass123!", user.password);
      expect(isMatch).toBe(true);
    });

    it("rejects expired reset OTP", async () => {
      await User.findByIdAndUpdate(testUser._id, {
        resetOtp: "5678",
        resetOtpExpires: Date.now() - 1000,
      });

      const res = await request(app)
        .post("/api/auth/password/reset")
        .send({
          email: "test@example.com",
          otp: "5678",
          newPassword: "NewPass123!",
        });

      expect(res.status).toBe(400);
    });
  });
});
