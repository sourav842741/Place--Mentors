import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { checkAndAssignBadges } from "../utils/badgeManager.js";
import { addXP } from "../utils/xpManager.js";

// ================= TIME TRACK =================
export const updateTimeSpent = asyncHandler(async (req, res) => {
  let { minutes } = req.body;

 minutes = Number(minutes);

if (minutes === undefined || isNaN(minutes) || minutes <= 0 || minutes > 300) {
  return res.status(400).json({
    success: false,
    message: "Invalid minutes",
  });
}

  const user = await User.findById(req.user._id);

  // ✅ safety for dailyStats
  if (!user.dailyStats) {
    user.dailyStats = [];
  }

  // ✅ better XP logic
  const xpEarned = minutes * 2;
  addXP(user, xpEarned);

  user.totalTimeSpent += minutes;

  const today = req.body.date || new Date().toISOString().split("T")[0];

  let todayData = user.dailyStats.find((d) => d.date === today);

  if (!todayData) {
    todayData = {
      date: today,
      timeSpent: 0,
      avgScore: 0,
      quizzesGiven: 0,
    };
    user.dailyStats.push(todayData);
  }

  todayData.timeSpent += minutes;

  //  get new badges
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

  //  validation (0–10 only)
  if (score === undefined || score < 0 || score > 10) {
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

  //  safety for dailyStats
  if (!user.dailyStats) {
    user.dailyStats = [];
  }

  //  XP logic (fixed 10 questions)
  let xpEarned = score * 10;

  //  perfect score bonus
  if (score === 10) {
    xpEarned += 50;
  }

  //  streak bonus
  xpEarned += (user.streakCount || 0) * 2;

  //  level tracking
  const oldLevel = user.level || 1;

  //  add XP
  addXP(user, xpEarned);

  //  badges
  const newBadges = checkAndAssignBadges(user);

const today = req.body.date || new Date().toISOString().split("T")[0];

  let todayData = user.dailyStats.find((d) => d.date === today);

  if (!todayData) {
    todayData = {
      date: today,
      timeSpent: 0,
      avgScore: 0,
      quizzesGiven: 0,
    };
    user.dailyStats.push(todayData);
  }

  //  weighted avg score
  todayData.avgScore =
    (todayData.avgScore * todayData.quizzesGiven + score) /
    (todayData.quizzesGiven + 1);

  todayData.quizzesGiven += 1;

  await user.save();

  res.status(200).json({
    success: true,
    score,
    xpEarned,
    totalXP: user.xp,
    level: user.level,
    leveledUp: user.level > oldLevel,

    //  progress bar
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