import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { createTestApp, clearCollections, createTestUser } from "../helpers/testApp.js";
import User from "../../models/user.model.js";

process.env.JWT_SECRET = "test-jwt-secret-for-integration-tests";

describe("Leaderboard Integration Tests", () => {
  let app;
  let mongoServer;

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
  });

  /* ================= EMPTY LEADERBOARD ================= */
  describe("GET /api/leaderboard/daily", () => {
    it("returns empty leaderboard when no users have activity", async () => {
      const res = await request(app).get("/api/leaderboard/daily");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.leaderboard).toEqual([]);
    });

    it("returns leaderboard with computed scores", async () => {
      const today = new Date().toISOString().split("T")[0];

      await User.create({
        fullName: "Active User 1",
        email: "active1@example.com",
        password: "hashedpass",
        skills: ["React"],
        dailyStats: [
          {
            date: today,
            timeSpent: 60,
            avgScore: 8,
            quizzesGiven: 2,
          },
        ],
        streakCount: 3,
      });

      await User.create({
        fullName: "Active User 2",
        email: "active2@example.com",
        password: "hashedpass",
        skills: ["Node.js"],
        dailyStats: [
          {
            date: today,
            timeSpent: 30,
            avgScore: 6,
            quizzesGiven: 1,
          },
        ],
        streakCount: 1,
      });

      const res = await request(app).get("/api/leaderboard/daily");

      expect(res.status).toBe(200);
      expect(res.body.leaderboard).toHaveLength(2);

      const first = res.body.leaderboard[0];
      expect(first.rank).toBe(1);
      expect(first.name).toBe("Active User 1");
      expect(first.score).toBeGreaterThan(0);
      expect(first.streak).toBe(3);
    });

    it("filters out users with zero score", async () => {
      await User.create({
        fullName: "Inactive User",
        email: "inactive@example.com",
        password: "hashedpass",
        skills: ["Java"],
        dailyStats: [],
        streakCount: 0,
      });

      const res = await request(app).get("/api/leaderboard/daily");

      expect(res.status).toBe(200);
      expect(res.body.leaderboard).toHaveLength(0);
    });

    it("assigns correct ranks in descending order", async () => {
      const today = new Date().toISOString().split("T")[0];

      await User.create({
        fullName: "High Scorer",
        email: "high@example.com",
        password: "hashedpass",
        skills: ["React"],
        dailyStats: [
          {
            date: today,
            timeSpent: 120,
            avgScore: 10,
            quizzesGiven: 5,
          },
        ],
        streakCount: 10,
      });

      await User.create({
        fullName: "Low Scorer",
        email: "low@example.com",
        password: "hashedpass",
        skills: ["Node.js"],
        dailyStats: [
          {
            date: today,
            timeSpent: 10,
            avgScore: 2,
            quizzesGiven: 0,
          },
        ],
        streakCount: 1,
      });

      const res = await request(app).get("/api/leaderboard/daily");

      expect(res.status).toBe(200);
      expect(res.body.leaderboard).toHaveLength(2);
      expect(res.body.leaderboard[0].rank).toBe(1);
      expect(res.body.leaderboard[1].rank).toBe(2);
      expect(res.body.leaderboard[0].score).toBeGreaterThan(res.body.leaderboard[1].score);
    });

    it("falls back to most recent daily stat when today is missing", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      await User.create({
        fullName: "Yesterday User",
        email: "yesterday@example.com",
        password: "hashedpass",
        skills: ["Python"],
        dailyStats: [
          {
            date: yesterdayStr,
            timeSpent: 45,
            avgScore: 7,
            quizzesGiven: 1,
          },
        ],
        streakCount: 2,
      });

      const res = await request(app).get("/api/leaderboard/daily");

      expect(res.status).toBe(200);
      expect(res.body.leaderboard).toHaveLength(1);
      expect(res.body.leaderboard[0].name).toBe("Yesterday User");
      expect(res.body.leaderboard[0].score).toBeGreaterThan(0);
    });
  });
});
