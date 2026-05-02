import { describe, it, expect } from "@jest/globals";
import { checkAndAssignBadges } from "../../utils/badgeManager.js";

describe("badgeManager", () => {
  const createUser = (overrides = {}) => ({
    streakCount: 0,
    xp: 0,
    level: 1,
    totalTimeSpent: 0,
    badges: [],
    ...overrides,
  });

  /* ================= STREAK BADGES ================= */
  describe("streak badges", () => {
    it("assigns 3 Day Streak badge at streakCount >= 3", () => {
      const user = createUser({ streakCount: 3 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "3 Day Streak 🔥")).toBe(true);
      expect(user.badges.some((b) => b.name === "3 Day Streak 🔥")).toBe(true);
    });

    it("assigns 7 Day Streak badge at streakCount >= 7", () => {
      const user = createUser({ streakCount: 7 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "7 Day Streak 🔥")).toBe(true);
    });

    it("assigns 15 Day Streak badge at streakCount >= 15", () => {
      const user = createUser({ streakCount: 15 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "15 Day Streak 🏆")).toBe(true);
    });

    it("assigns 30 Day Streak badge at streakCount >= 30", () => {
      const user = createUser({ streakCount: 30 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "30 Day Streak 👑")).toBe(true);
    });

    it("does NOT assign streak badge below threshold", () => {
      const user = createUser({ streakCount: 2 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.type === "streak")).toBe(false);
    });
  });

  /* ================= XP BADGES ================= */
  describe("XP badges", () => {
    it("assigns XP Beginner at xp >= 100", () => {
      const user = createUser({ xp: 100 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "XP Beginner 💪")).toBe(true);
    });

    it("assigns XP Legend at xp >= 5000", () => {
      const user = createUser({ xp: 5000 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "XP Legend 👑")).toBe(true);
    });

    it("does NOT assign XP badge below threshold", () => {
      const user = createUser({ xp: 50 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.type === "xp")).toBe(false);
    });
  });

  /* ================= TIME BADGES ================= */
  describe("time badges", () => {
    it("assigns Getting Started at totalTimeSpent >= 30", () => {
      const user = createUser({ totalTimeSpent: 30 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "Getting Started ⏱️")).toBe(true);
    });

    it("assigns Grinder at totalTimeSpent >= 3000", () => {
      const user = createUser({ totalTimeSpent: 3000 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "Grinder 🔥")).toBe(true);
    });
  });

  /* ================= LEVEL BADGES ================= */
  describe("level badges", () => {
    it("assigns Level 2 at level >= 2", () => {
      const user = createUser({ level: 2 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "Level 2 🚀")).toBe(true);
    });

    it("assigns Level 20 at level >= 20", () => {
      const user = createUser({ level: 20 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "Level 20 👑")).toBe(true);
    });
  });

  /* ================= COMBO BADGES ================= */
  describe("combo badges", () => {
    it("assigns Consistent Learner at streak >= 7 && xp >= 500", () => {
      const user = createUser({ streakCount: 7, xp: 500 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "Consistent Learner 💎")).toBe(true);
    });

    it("does NOT assign Consistent Learner if only streak meets", () => {
      const user = createUser({ streakCount: 7, xp: 100 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "Consistent Learner 💎")).toBe(false);
    });

    it("assigns Legendary Player at level >= 10 && xp >= 3000", () => {
      const user = createUser({ level: 10, xp: 3000 });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "Legendary Player 👑")).toBe(true);
    });
  });

  /* ================= DUPLICATE PREVENTION ================= */
  describe("duplicate badge prevention", () => {
    it("does not assign duplicate badge", () => {
      const user = createUser({
        streakCount: 3,
        badges: [{ name: "3 Day Streak 🔥", earnedAt: new Date() }],
      });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.some((b) => b.name === "3 Day Streak 🔥")).toBe(false);
      expect(user.badges.filter((b) => b.name === "3 Day Streak 🔥")).toHaveLength(1);
    });

    it("initializes badges array if undefined", () => {
      const user = createUser({ streakCount: 3 });
      delete user.badges;
      checkAndAssignBadges(user);
      expect(Array.isArray(user.badges)).toBe(true);
    });
  });

  /* ================= MULTIPLE BADGES AT ONCE ================= */
  describe("multiple badges assignment", () => {
    it("assigns all eligible badges in one call", () => {
      const user = createUser({
        streakCount: 30,
        xp: 5000,
        level: 20,
        totalTimeSpent: 3000,
      });
      const newBadges = checkAndAssignBadges(user);
      expect(newBadges.length).toBeGreaterThan(10);
      expect(user.badges.length).toBe(newBadges.length);
    });
  });
});
