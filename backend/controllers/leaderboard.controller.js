import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const getDailyLeaderboard = asyncHandler(async (req, res) => {
  // ── Pagination params ──
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  // ── Optional auth for myRank ──
  let currentUserId = null;
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      currentUserId = decoded.userId;
    }
  } catch {
    // ignore invalid token — leaderboard is public
  }

  const users = await User.find();

  //  FIXED DATE (timezone safe)
  const today = new Date().toISOString().split("T")[0];

  const leaderboard = users.map((user) => {
    const stats = Array.isArray(user.dailyStats) ? user.dailyStats : [];

    //  find today's data
    let todayStat = stats.find((d) => d.date === today);

    //  fallback (IMPORTANT)
    if (!todayStat && stats.length > 0) {
      todayStat = stats.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    }

    //  USE CORRECT FIELDS (dailyStats, NOT totalTimeSpent)
    const totalTime = todayStat?.timeSpent || 0;
    const totalQuizzes = todayStat?.quizzesGiven || 0;
    const avgAccuracy = todayStat?.avgScore || 0;

    //  SCORE CALCULATION
    const score = totalTime * 0.5 + avgAccuracy * 2 + totalQuizzes * 5;

    return {
      userId: user._id.toString(),
      name: user.fullName,
      avatar: user.avatar || "",
      score: Math.round(score),
      streak: user.streakCount || 0,
      accuracy: avgAccuracy,
      timeSpent: totalTime,
    };
  });

  //  REMOVE USERS WITH 0 SCORE
  const filtered = leaderboard.filter((user) => user.score > 0);

  //  SORT
  const sorted = filtered.sort((a, b) => b.score - a.score);

  //  ADD GLOBAL RANK
  const finalLeaderboard = sorted.map((user, index) => ({
    ...user,
    rank: index + 1,
  }));

  // ── Extract top 3 (always shown) ──
  const topThree = finalLeaderboard.slice(0, 3);

  const total = finalLeaderboard.length;
  const pages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;
  const paginated = finalLeaderboard.slice(skip, skip + limit);

  // ── Find current user's rank & time ──
  let myRank = null;
  let myTime = 0;

  if (currentUserId) {
    const me = finalLeaderboard.find((u) => u.userId === currentUserId);
    if (me) {
      myRank = me.rank;
      myTime = me.timeSpent || 0;
    }
  }

  res.status(200).json({
    success: true,
    topThree,
    leaderboard: paginated,
    page,
    pages,
    total,
    limit,
    myRank,
    myTime,
  });
});
