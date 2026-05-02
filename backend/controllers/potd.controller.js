import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { addXP } from "../utils/xpManager.js";
import { getOrCreateTodayPotd, generateTodayPotd } from "../services/potd.service.js";

const getTodayDate = () => new Date().toISOString().split("T")[0]; // YYYY-MM-DD

// ================= GENERATE POTD =================
export const generatePotd = asyncHandler(async (req, res) => {
  const potd = await generateTodayPotd();

  return res.status(201).json({
    success: true,
    message: "POTD generated successfully",
    data: potd,
  });
});

// ================= GET TODAY POTD =================
export const getTodayPotd = asyncHandler(async (req, res) => {
  const potd = await getOrCreateTodayPotd();

  return res.status(200).json({
    success: true,
    message: "Today's POTD",
    data: potd,
  });
});

// ================= SUBMIT POTD =================
export const submitPotd = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  const today = getTodayDate();

  const potd = await getOrCreateTodayPotd();
  if (!potd) {
    return res.status(404).json({
      success: false,
      message: "No POTD found",
    });
  }

  //  validation
  if (!answers || !Array.isArray(answers) || answers.length !== 15) {
    return res.status(400).json({
      success: false,
      message: "Submit exactly 15 answers",
    });
  }

  let score = 0;
  let xpEarned = 0;

  const results = [];

  //  category stats safe
  const categoryStats = {
    aptitude: { correct: 0, total: 0 },
    reasoning: { correct: 0, total: 0 },
    verbal: { correct: 0, total: 0 },
  };

  //  normalize function
  const normalizeCategory = (cat = "") => {
    const c = cat.toLowerCase();

    if (c.includes("aptitude")) return "aptitude";
    if (c.includes("reasoning")) return "reasoning";
    if (c.includes("verbal")) return "verbal";

    return "aptitude"; // fallback
  };

  potd.questions.forEach((q, index) => {
    // flexible answer handling
    const userAnswer =
      typeof answers[index] === "object" ? answers[index]?.selected : answers[index];

    const isCorrect = userAnswer === q.answer;

    const category = normalizeCategory(q.category);

    //  XP + score
    if (isCorrect) {
      score++;

      const xp = q.difficulty === "easy" ? 5 : q.difficulty === "medium" ? 10 : 20;

      xpEarned += xp;
      categoryStats[category].correct++;
    }

    categoryStats[category].total++;

    results.push({
      question: q.question,
      userAnswer,
      correctAnswer: q.answer,
      isCorrect,
      explanation: q.explanation || "No explanation provided",
      difficulty: q.difficulty,
    });
  });

  //  weak area calculation
  let weakArea = "aptitude";
  let lowestAccuracy = 1;

  Object.entries(categoryStats).forEach(([cat, stats]) => {
    const acc = stats.total === 0 ? 1 : stats.correct / stats.total;

    if (acc < lowestAccuracy) {
      lowestAccuracy = acc;
      weakArea = cat;
    }
  });

  //  user safety
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  //  MARK POTD COMPLETED
  const todayDate = new Date().toISOString().split("T")[0];
  user.potdCompleted = true;
  user.lastPotdDate = todayDate;
  user.lastPotdAt = new Date();

  user.weakArea = weakArea;

  addXP(user, xpEarned, "potd");

  //  daily stats
  user.dailyStats = user.dailyStats || [];

  const todayStat = user.dailyStats.find((s) => s.date === today);

  if (todayStat) {
    todayStat.quizzesGiven += 1;
    todayStat.avgScore =
      (todayStat.avgScore * (todayStat.quizzesGiven - 1) + score) / todayStat.quizzesGiven;
  } else {
    user.dailyStats.push({
      date: today,
      quizzesGiven: 1,
      avgScore: score,
    });
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: "POTD submitted successfully",
    data: {
      score,
      total: 15,
      percentage: Math.round((score / 15) * 100),
      correctAnswers: score,
      wrongAnswers: 15 - score,
      weakArea,
      xpEarned,
      results,
    },
  });
});

// ================= POTD STATUS =================
export const getPotdStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const now = new Date();
  const limit = 24 * 60 * 60 * 1000;

  const diff = user.lastPotdAt ? now - user.lastPotdAt : null;

  const locked = user.lastPotdAt && diff < limit;

  const remaining = locked ? limit - diff : 0;

  res.json({
    success: true,
    data: { locked, remaining, solved: user.potdCompleted },
  });
});

// ================= COMPLETE POTD (cooldown timer) =================
export const completePotd = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.potdCompleted = true;
  user.lastPotdAt = new Date();
  user.lastPotdDate = new Date().toISOString().split("T")[0]; // keep compatibility
  await user.save();

  return res.status(200).json({
    success: true,
    message: "POTD marked complete, cooldown started",
    data: {
      locked: true,
      unlockAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  });
});
