import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDailyLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find();

const today = new Date().toLocaleDateString("en-CA");

 const leaderboard = users.map((user) => {
  let stat =
    user.dailyStats.find((d) => d.date === today) ||
    user.dailyStats[user.dailyStats.length - 1];

  const score = stat
    ? (stat.timeSpent * 0.5) +
      (stat.avgScore * 2) +
      (stat.quizzesGiven * 5)
    : 0;

  return {
    name: user.fullName,
    avatar: user.avatar || "",
    score,
    streak: user.streakCount || 0,
    accuracy: stat?.avgScore || 0,
  };
});


  const sorted = leaderboard.sort((a, b) => b.score - a.score);

  res.status(200).json({
    success: true,
    leaderboard: sorted,
  });
});