import { describe, it, expect } from "@jest/globals";
import { handleLoginStreak } from "../../utils/streakManager.js";

describe("streakManager", () => {
  const createUser = (overrides = {}) => ({
    streakCount: 0,
    longestStreak: 0,
    lastLoginDate: null,
    xp: 0,
    level: 1,
    currentLevelXP: 0,
    nextLevelXP: 100,
    ...overrides,
  });

  /* ================= FIRST LOGIN ================= */
  describe("first login", () => {
    it("sets streakCount to 1 on first login", () => {
      const user = createUser();
      handleLoginStreak(user);
      expect(user.streakCount).toBe(1);
    });

    it("awards XP on first login", () => {
      const user = createUser();
      handleLoginStreak(user);
      expect(user.xp).toBe(10);
    });

    it("sets longestStreak to 1 on first login", () => {
      const user = createUser();
      handleLoginStreak(user);
      expect(user.longestStreak).toBe(1);
    });
  });

  /* ================= CONSECUTIVE DAYS ================= */
  describe("consecutive day login", () => {
    it("increments streak by 1 for next day login", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const user = createUser({ streakCount: 5, lastLoginDate: yesterday });
      handleLoginStreak(user);
      expect(user.streakCount).toBe(6);
    });

    it("awards XP for consecutive day login", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const user = createUser({ streakCount: 2, lastLoginDate: yesterday, xp: 0 });
      handleLoginStreak(user);
      expect(user.xp).toBe(10);
    });
  });

  /* ================= STREAK RESET ================= */
  describe("streak reset on gap", () => {
    it("resets streak to 1 after missing a day", () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      twoDaysAgo.setHours(0, 0, 0, 0);

      const user = createUser({ streakCount: 10, lastLoginDate: twoDaysAgo });
      handleLoginStreak(user);
      expect(user.streakCount).toBe(1);
    });

    it("does NOT award XP when streak resets", () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      twoDaysAgo.setHours(0, 0, 0, 0);

      const user = createUser({ streakCount: 5, lastLoginDate: twoDaysAgo, xp: 100 });
      handleLoginStreak(user);
      expect(user.xp).toBe(100); // unchanged
    });
  });

  /* ================= SAME DAY LOGIN ================= */
  describe("same day login", () => {
    it("does not change streak on same day login", () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const user = createUser({ streakCount: 5, lastLoginDate: today });
      handleLoginStreak(user);
      // Same day: diffDays === 0, so neither increment nor reset triggers
      expect(user.streakCount).toBe(5);
    });
  });

  /* ================= LONGEST STREAK TRACKING ================= */
  describe("longestStreak tracking", () => {
    it("updates longestStreak when current exceeds", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const user = createUser({ streakCount: 9, longestStreak: 9, lastLoginDate: yesterday });
      handleLoginStreak(user);
      expect(user.longestStreak).toBe(10);
    });

    it("preserves longestStreak when current is lower", () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      twoDaysAgo.setHours(0, 0, 0, 0);

      const user = createUser({ streakCount: 20, longestStreak: 30, lastLoginDate: twoDaysAgo });
      handleLoginStreak(user);
      expect(user.longestStreak).toBe(30);
    });
  });

  /* ================= LAST LOGIN DATE ================= */
  describe("lastLoginDate update", () => {
    it("sets lastLoginDate to today after any login", () => {
      const user = createUser();
      handleLoginStreak(user);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(user.lastLoginDate.getTime()).toBe(today.getTime());
    });
  });
});
