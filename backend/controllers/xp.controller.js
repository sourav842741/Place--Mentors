import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { checkAndAssignBadges } from "../utils/badgeManager.js";
import { addXP } from "../utils/xpManager.js";

// ================= TIME TRACK =================
export const updateTimeSpent = asyncHandler(async (req, res) => {
  let { minutes } = req.body;

  minutes = Number(minutes);

  if (isNaN(minutes) || minutes <= 0 || minutes > 300) {
    return res.status(400).json({
      success: false,
      message: "Invalid minutes",
    });
  }

  const user = await User.findById(req.user._id);

  //  safe array check
  if (!Array.isArray(user.dailyStats)) {
    user.dailyStats = [];
  }

  // XP
  const xpEarned = minutes * 2;
  addXP(user, xpEarned);

  user.totalTimeSpent += minutes;

  const today = new Date().toISOString().split("T")[0];

  let todayData = user.dailyStats.find((d) => d.date === today);

  if (!todayData) {
    user.dailyStats.push({
      date: today,
      timeSpent: 0,
      avgScore: 0,
      quizzesGiven: 0,
    });

    todayData = user.dailyStats[user.dailyStats.length - 1];
  }

  todayData.timeSpent += minutes;

  const newBadges = checkAndAssignBadges(user);

  await user.save();

  res.status(200).json({
    success: true,
    xp: user.xp,
    level: user.level,
    totalTime: user.totalTimeSpent,
    newBadges,
  });
});

// ================= QUIZ =================
export const completeQuiz = asyncHandler(async (req, res) => {
  let { score } = req.body;

  score = Number(score);

  if (isNaN(score) || score < 0 || score > 10) {
    return res.status(400).json({
      success: false,
      message: "Score must be between 0 and 10",
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // safe array
  if (!Array.isArray(user.dailyStats)) {
    user.dailyStats = [];
  }

  // remove bad data
  user.dailyStats = user.dailyStats.filter((d) => d && typeof d === "object" && d.date);

  // ================= XP =================
  let xpEarned = score * 10;

  if (score === 10) {
    xpEarned += 50;
  }

  // streak cap
  xpEarned += Math.min(user.streakCount || 0, 10) * 2;

  const oldLevel = user.level || 1;

  addXP(user, xpEarned);

  const newBadges = checkAndAssignBadges(user);

  const today = new Date().toLocaleDateString("en-CA");

  let todayData = user.dailyStats.find((d) => d.date === today);

  if (!todayData) {
    user.dailyStats.push({
      date: today,
      timeSpent: 0,
      avgScore: 0,
      quizzesGiven: 0,
    });

    todayData = user.dailyStats[user.dailyStats.length - 1];
  }

  const prevAvg = todayData.avgScore || 0;
  const prevCount = todayData.quizzesGiven || 0;

  const newAvg = (prevAvg * prevCount + score) / (prevCount + 1);

  todayData.avgScore = Number(newAvg.toFixed(1));
  todayData.quizzesGiven = prevCount + 1;

  if (!todayData.timeSpent) {
    todayData.timeSpent = 10;
  }

  await user.save();

  res.status(200).json({
    success: true,
    score,
    xpEarned,
    totalXP: user.xp,
    level: user.level,
    leveledUp: user.level > oldLevel,
    currentLevelXP: user.currentLevelXP,
    nextLevelXP: user.nextLevelXP,
    newBadges,
  });
});

// ================= BADGES =================
export const getUserBadges = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("badges");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    badges: user.badges || [],
  });
});
