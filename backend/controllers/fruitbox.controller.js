import FruitboxProgress from "../models/FruitboxProgress.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getProgress = asyncHandler(async (req, res) => {
  let progress = await FruitboxProgress.findOne({ userId: req.userId });

  if (!progress) {
    progress = new FruitboxProgress({
      userId: req.userId,
      currentLevel: 1,
      completedLevels: [],
      totalXP: 0,
    });

    await progress.save();
  }

  res.status(200).json(new ApiResponse(200, progress, "Progress fetched successfully"));
});

export const updateProgress = asyncHandler(async (req, res) => {
  const { level, earnedXP = 0 } = req.body;

  // Validate level
  if (!level || level < 1 || level > 15) {
    res.status(400);
    throw new Error("Invalid level");
  }

  let progress = await FruitboxProgress.findOne({
    userId: req.userId,
  });

  if (!progress) {
    progress = new FruitboxProgress({
      userId: req.userId,
      currentLevel: 1,
      completedLevels: [],
      totalXP: 0,
    });
  }

  const alreadyCompleted = progress.completedLevels.includes(level);

  // Reward only first time
  if (!alreadyCompleted) {
    progress.completedLevels.push(level);

    // keep sorted
    progress.completedLevels.sort((a, b) => a - b);

    progress.totalXP += Number(earnedXP) || 0;

    // prevent level 16 bug
    progress.currentLevel = Math.min(Math.max(progress.currentLevel, level + 1), 15);

    progress.lastPlayedAt = new Date();

    await progress.save();

    // Update User XP
    const user = await User.findById(req.userId);

    if (user) {
      user.xp += Number(earnedXP) || 0;

      // Auto level system (100 XP = 1 level)
      user.level = Math.floor(user.xp / 100) + 1;

      user.currentLevelXP = user.xp % 100;

      user.nextLevelXP = 100;

      await user.save();
    }
  }

  res.status(200).json(new ApiResponse(200, progress, "Progress updated successfully"));
});

export const resetProgress = asyncHandler(async (req, res) => {
  await FruitboxProgress.findOneAndDelete({
    userId: req.userId,
  });

  res.status(200).json(new ApiResponse(200, {}, "Progress reset successfully"));
});
