import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getWeeklyStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

   
    const date = d.toLocaleDateString("en-CA");

    const dayData = user.dailyStats.find(x => x.date === date);

    result.push({
      date: date,
      timeSpent: dayData?.timeSpent || 0,
      avgScore: dayData?.avgScore || 0,
    });
  }

  res.json({
    success: true,
    weeklyData: result,
  });
});

export const getStreak = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('streakCount longestStreak dailyStats');
  const today = new Date().toISOString().split('T')[0];
  const completedDays = user.dailyStats.filter(stat => stat.timeSpent > 0 || stat.avgScore > 0).map(stat => stat.date);
  const todaySolved = user.dailyStats.some(stat => stat.date === today && (stat.timeSpent > 0 || stat.avgScore > 0));
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const remainingMs = tomorrow - now;
  const h = Math.floor(remainingMs / 3600000);
  const m = Math.floor((remainingMs % 3600000) / 60000);
  const s = Math.floor((remainingMs % 60000) / 1000);
  const remainingTime = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  res.json({
    success: true,
    currentStreak: user.streakCount || 0,
    bestStreak: user.longestStreak || 0,
    completedDays,
    todaySolved,
    remainingTime
  });
});

