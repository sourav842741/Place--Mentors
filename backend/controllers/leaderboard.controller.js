import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
export const getDailyLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find();

  const today = new Date().toLocaleDateString("en-CA");

  const leaderboard = users.map((user) => {
    const stats = Array.isArray(user.dailyStats) ? user.dailyStats : [];

    const todayStat = stats.find((d) => d.date === today);

   const totalTime = user.totalTimeSpent || 0;
    const totalQuizzes = todayStat?.quizzesGiven || 0;
    const avgAccuracy = todayStat?.avgScore || 0;

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
      timeSpent: user.totalTimeSpent || 0,
    };
  });

 const sorted = leaderboard.sort((a, b) => b.score - a.score);

// 🔥 ADD RANK + USER IDENTIFY
const finalLeaderboard = sorted.map((user, index) => ({
  ...user,
  rank: index + 1,
}));

res.status(200).json({
  success: true,
  leaderboard: finalLeaderboard,
});
});