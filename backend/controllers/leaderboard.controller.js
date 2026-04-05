import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDailyLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find();

 
  const today = new Date().toISOString().split("T")[0];

const leaderboard = users.map((user) => {

  const validStats = user.dailyStats = user.dailyStats.filter(
  (d) => d && d.date && !isNaN(new Date(d.date))
);
  let totalScore = 0;
  let totalQuizzes = 0;
  let totalTime = 0;

  validStats.forEach((d) => {
    totalScore += (d.avgScore || 0) * (d.quizzesGiven || 0);
    totalQuizzes += d.quizzesGiven || 0;
    totalTime += d.timeSpent || 0;
  });

  const avgAccuracy =
    totalQuizzes > 0
      ? Math.round(totalScore / totalQuizzes)
      : 0;

  const score =
    (totalTime * 0.5) +
    (avgAccuracy * 2) +
    (totalQuizzes * 5);

  return {
    name: user.fullName,
    avatar: user.avatar || "",
    score: Math.round(score),
    streak: user.streakCount || 0,
    accuracy: avgAccuracy,
  };
});

  const sorted = leaderboard.sort((a, b) => b.score - a.score);

  res.status(200).json({
    success: true,
    leaderboard: sorted,
  });
});