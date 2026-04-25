import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { createTestApp, clearCollections, createTestUser } from "../helpers/testApp.js";
import User from "../../models/user.model.js";

process.env.JWT_SECRET = "test-jwt-secret-for-integration-tests";

describe("XP & Gamification Integration Tests", () => {
  let app;
  let mongoServer;
  let user;
  let cookies;

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
    const login = await request(app)
      .post("/api/auth/signin")
      .send({ email: "test@example.com", password: "TestPass123!" });
    cookies = login.headers["set-cookie"];
  });

  /* ================= TIME TRACKING ================= */
  describe("POST /api/xp/time", () => {
    it("adds XP for time spent", async () => {
      const res = await request(app)
        .post("/api/xp/time")
        .set("Cookie", cookies)
        .send({ minutes: 30 });

      expect(res.status).toBe(200);
      expect(res.body.xp).toBe(60); // 30 * 2
      expect(res.body.totalTime).toBe(30);
      expect(res.body.newBadges).toBeInstanceOf(Array);
    });

    it("caps minutes at 300", async () => {
      const res = await request(app)
        .post("/api/xp/time")
        .set("Cookie", cookies)
        .send({ minutes: 400 });

      expect(res.status).toBe(400);
    });

    it("rejects negative minutes", async () => {
      const res = await request(app)
        .post("/api/xp/time")
        .set("Cookie", cookies)
        .send({ minutes: -5 });

      expect(res.status).toBe(400);
    });

    it("rejects zero minutes", async () => {
      const res = await request(app)
        .post("/api/xp/time")
        .set("Cookie", cookies)
        .send({ minutes: 0 });

      expect(res.status).toBe(400);
    });

    it("rejects non-numeric minutes", async () => {
      const res = await request(app)
        .post("/api/xp/time")
        .set("Cookie", cookies)
        .send({ minutes: "abc" });

      expect(res.status).toBe(400);
    });

    it("tracks daily stats correctly", async () => {
      await request(app)
        .post("/api/xp/time")
        .set("Cookie", cookies)
        .send({ minutes: 15 });

      const updated = await User.findById(user._id);
      const today = new Date().toISOString().split("T")[0];
      const todayStat = updated.dailyStats.find((d) => d.date === today);

      expect(todayStat).toBeTruthy();
      expect(todayStat.timeSpent).toBe(15);
    });
  });

  /* ================= QUIZ COMPLETION ================= */
  describe("POST /api/xp/quiz", () => {
    it("awards XP for quiz score", async () => {
      const res = await request(app)
        .post("/api/xp/quiz")
        .set("Cookie", cookies)
        .send({ score: 8 });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(8);
      expect(res.body.xpEarned).toBe(82); // 8*10 + streak bonus (1*2)
      expect(res.body.totalXP).toBeGreaterThan(0);
    });

    it("gives bonus XP for perfect score", async () => {
      const res = await request(app)
        .post("/api/xp/quiz")
        .set("Cookie", cookies)
        .send({ score: 10 });

      expect(res.status).toBe(200);
      expect(res.body.xpEarned).toBe(152); // 10*10 + 50 bonus + streak
    });

    it("rejects score below 0", async () => {
      const res = await request(app)
        .post("/api/xp/quiz")
        .set("Cookie", cookies)
        .send({ score: -1 });

      expect(res.status).toBe(400);
    });

    it("rejects score above 10", async () => {
      const res = await request(app)
        .post("/api/xp/quiz")
        .set("Cookie", cookies)
        .send({ score: 11 });

      expect(res.status).toBe(400);
    });

    it("tracks quiz count in daily stats", async () => {
      await request(app)
        .post("/api/xp/quiz")
        .set("Cookie", cookies)
        .send({ score: 7 });

      const updated = await User.findById(user._id);
      const today = new Date().toLocaleDateString("en-CA");
      const todayStat = updated.dailyStats.find((d) => d.date === today);

      expect(todayStat.quizzesGiven).toBe(1);
      expect(todayStat.avgScore).toBe(7);
    });

    it("calculates running average for multiple quizzes", async () => {
      await request(app)
        .post("/api/xp/quiz")
        .set("Cookie", cookies)
        .send({ score: 6 });

      await request(app)
        .post("/api/xp/quiz")
        .set("Cookie", cookies)
        .send({ score: 8 });

      const updated = await User.findById(user._id);
      const today = new Date().toLocaleDateString("en-CA");
      const todayStat = updated.dailyStats.find((d) => d.date === today);

      expect(todayStat.quizzesGiven).toBe(2);
      expect(todayStat.avgScore).toBe(7);
    });
  });

  /* ================= BADGES ================= */
  describe("GET /api/xp/badges", () => {
    it("returns user badges", async () => {
      // First earn some XP to trigger badges
      await request(app)
        .post("/api/xp/time")
        .set("Cookie", cookies)
        .send({ minutes: 30 });

      const res = await request(app)
        .get("/api/xp/badges")
        .set("Cookie", cookies);

      expect(res.status).toBe(200);
      expect(res.body.badges).toBeInstanceOf(Array);
    });

    it("returns empty array for new user", async () => {
      const res = await request(app)
        .get("/api/xp/badges")
        .set("Cookie", cookies);

      expect(res.status).toBe(200);
      expect(res.body.badges).toEqual([]);
    });
  });

  /* ================= LEVEL UP ================= */
  describe("Level progression", () => {
    it("levels up when XP threshold crossed", async () => {
      // Give enough XP to level up
      await User.findByIdAndUpdate(user._id, { xp: 95 });

      const res = await request(app)
        .post("/api/xp/quiz")
        .set("Cookie", cookies)
        .send({ score: 10 });

      expect(res.status).toBe(200);
      expect(res.body.leveledUp).toBe(true);
      expect(res.body.level).toBeGreaterThan(1);
    });
  });
});
