import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getWeeklyStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    // ✅ FIXED DATE
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