import { hashKey } from "./redisCache.js";

export const cacheKey = {
  dashboardWeekly: ({ userId }) => `cache:dashboard:weekly:${userId}`,
  dashboardStreak: ({ userId }) => `cache:dashboard:streak:${userId}`,
  dashboardTaskStats: ({ userId }) => `cache:dashboard:tasks:${userId}`,

  potdToday: () => `cache:potd:today`,
  cpotdToday: () => `cache:cpotd:today`,

  leaderboardDaily: ({ date, page, limit }) => `cache:leaderboard:daily:${date}:p${page}:l${limit}`,

  leaderboardTopThreeForPage: ({ date }) => `cache:leaderboard:top3:${date}`,

  // Optional: myRank/time is user-specific, but computed from full leaderboard.
  leaderboardMyRank: ({ date, userId, page, limit }) =>
    `cache:leaderboard:my:${date}:u${userId}:p${page}:l${limit}`,

  // helper to hash arbitrary strings for keys
  hash: (value) => hashKey(value),
};
