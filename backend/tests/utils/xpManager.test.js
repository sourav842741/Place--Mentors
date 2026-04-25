import { describe, it, expect } from '@jest/globals';
import { addXP, calculatePotdXP } from '../../utils/xpManager.js';

describe('xpManager', () => {
  const createUser = (overrides = {}) => ({
    xp: 0,
    level: 1,
    currentLevelXP: 0,
    nextLevelXP: 100,
    ...overrides,
  });

  /* ================= addXP ================= */
  describe('addXP', () => {
    it('adds XP to user', () => {
      const user = createUser();
      addXP(user, 50);
      expect(user.xp).toBe(50);
    });

    it('stays at level 1 when XP < 100', () => {
      const user = createUser();
      addXP(user, 50);
      expect(user.level).toBe(1);
      expect(user.currentLevelXP).toBe(50);
      expect(user.nextLevelXP).toBe(100);
    });

    it('levels up to 2 when XP reaches 100', () => {
      const user = createUser();
      addXP(user, 100);
      expect(user.level).toBe(2);
      expect(user.currentLevelXP).toBe(0);
      expect(user.nextLevelXP).toBe(200);
    });

    it('levels up to 3 when XP reaches 300 (100 + 200)', () => {
      const user = createUser();
      addXP(user, 300);
      expect(user.level).toBe(3);
      expect(user.currentLevelXP).toBe(0);
      expect(user.nextLevelXP).toBe(300);
    });

    it('handles XP overflow correctly', () => {
      const user = createUser();
      addXP(user, 150);
      // Level 1→2 at 100, remaining 50 goes to level 2
      expect(user.level).toBe(2);
      expect(user.currentLevelXP).toBe(50);
      expect(user.nextLevelXP).toBe(200);
    });

    it('handles large XP amounts', () => {
      const user = createUser();
      addXP(user, 1000);
      // 100 + 200 + 300 + 400 = 1000 → level 5
      expect(user.level).toBe(5);
      expect(user.currentLevelXP).toBe(0);
      expect(user.nextLevelXP).toBe(500);
    });

    it('handles partial overflow across multiple levels', () => {
      const user = createUser();
      addXP(user, 550);
      // 100 + 200 + 300 = 600 needed for level 4
      // 550 = level 3 with 250 XP in that level
      expect(user.level).toBe(3);
      expect(user.currentLevelXP).toBe(250);
      expect(user.nextLevelXP).toBe(300);
    });

    it('initializes xp and level if undefined', () => {
      const user = {};
      addXP(user, 10);
      expect(user.xp).toBe(10);
      expect(user.level).toBe(1);
    });

    it('accepts custom source parameter', () => {
      const user = createUser();
      addXP(user, 25, 'potd');
      expect(user.xp).toBe(25);
    });
  });

  /* ================= calculatePotdXP ================= */
  describe('calculatePotdXP', () => {
    it('calculates 0 XP for all wrong answers', () => {
      const questions = [
        { difficulty: 'easy' },
        { difficulty: 'medium' },
        { difficulty: 'hard' },
      ];
      const correctAnswers = [false, false, false];
      expect(calculatePotdXP(correctAnswers, questions)).toBe(0);
    });

    it('calculates XP by difficulty', () => {
      const questions = [
        { difficulty: 'easy' },
        { difficulty: 'medium' },
        { difficulty: 'hard' },
      ];
      const correctAnswers = [true, true, true];
      expect(calculatePotdXP(correctAnswers, questions)).toBe(5 + 10 + 20);
    });

    it('gives 5 XP for easy correct answer', () => {
      const questions = [{ difficulty: 'easy' }];
      expect(calculatePotdXP([true], questions)).toBe(5);
    });

    it('gives 10 XP for medium correct answer', () => {
      const questions = [{ difficulty: 'medium' }];
      expect(calculatePotdXP([true], questions)).toBe(10);
    });

    it('gives 20 XP for hard correct answer', () => {
      const questions = [{ difficulty: 'hard' }];
      expect(calculatePotdXP([true], questions)).toBe(20);
    });

    it('handles mixed correct/incorrect answers', () => {
      const questions = [
        { difficulty: 'easy' },
        { difficulty: 'hard' },
        { difficulty: 'medium' },
      ];
      const correctAnswers = [true, false, true];
      expect(calculatePotdXP(correctAnswers, questions)).toBe(5 + 0 + 10);
    });
  });
});

