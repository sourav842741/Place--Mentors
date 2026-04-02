import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { checkAndAssignBadges } from "../utils/badgeManager.js";
import { addXP } from "../utils/xpManager.js";

// ================= TIME TRACK =================
export const updateTimeSpent = asyncHandler(async (req, res) => {
  let { minutes } = req.body;

  if (!minutes || minutes <= 0 || minutes > 10) {
    return res.status(400).json({
      success: false,
      message: "Invalid minutes",
    });
  }

  const user = await User.findById(req.user._id);

  //  use addXP
  addXP(user, minutes);

  user.totalTimeSpent += minutes;

  //  get new badges
  const newBadges = checkAndAssignBadges(user);

  await user.save();

  res.status(200).json({
    success: true,
    xp: user.xp,
    level: user.level,
    totalTime: user.totalTimeSpent,
    newBadges, //  IMPORTANT
  });
});


// ================= QUIZ =================
export const completeQuiz = asyncHandler(async (req, res) => {
  let { score } = req.body;

  // validation
  if (score === undefined || score < 0 || score > 20) {
    return res.status(400).json({
      success: false,
      message: "Invalid score",
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const xpEarned = score * 5;

  //  FIX 1: old level store (for animation)
  const oldLevel = user.level;

  //  FIX 2: use addXP instead of direct xp
  addXP(user, xpEarned);

  //  FIX 3: get new badges
  const newBadges = checkAndAssignBadges(user);

  await user.save();

  res.status(200).json({
    success: true,
    xpEarned,
    totalXP: user.xp,
    level: user.level,
    leveledUp: user.level > oldLevel, // 
    newBadges, // 
  });
});

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