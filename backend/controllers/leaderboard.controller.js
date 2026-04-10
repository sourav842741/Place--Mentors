import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDailyLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find();

  //  FIXED DATE (timezone safe)
  const today = new Date().toISOString().split("T")[0];

  const leaderboard = users.map((user) => {
    const stats = Array.isArray(user.dailyStats) ? user.dailyStats : [];

    //  find today's data
    let todayStat = stats.find((d) => d.date === today);

    //  fallback (IMPORTANT)
    if (!todayStat && stats.length > 0) {
      todayStat = stats.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )[0];
    }


    //  USE CORRECT FIELDS (dailyStats, NOT totalTimeSpent)
    const totalTime = todayStat?.timeSpent || 0;
    const totalQuizzes = todayStat?.quizzesGiven || 0;
    const avgAccuracy = todayStat?.avgScore || 0;

    //  SCORE CALCULATION
    const score =
      totalTime * 0.5 +
      avgAccuracy * 2 +
      totalQuizzes * 5;

    return {
      name: user.fullName,
      avatar: user.avatar || "",
      score: Math.round(score),
      streak: user.streakCount || 0,
      accuracy: avgAccuracy,
      timeSpent: totalTime,
    };
  });

  //  REMOVE USERS WITH 0 SCORE (optional but recommended)
  const filtered = leaderboard.filter((user) => user.score > 0);

  //  SORT
  const sorted = filtered.sort((a, b) => b.score - a.score);

  //  ADD RANK
  const finalLeaderboard = sorted.map((user, index) => ({
    ...user,
    rank: index + 1,
  }));

  res.status(200).json({
    success: true,
    leaderboard: finalLeaderboard,
  });
});