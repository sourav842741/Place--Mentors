import { asyncHandler } from "../utils/asyncHandler.js";
import Potd from "../models/Potd.js";
import User from "../models/user.model.js";
import { askAi, extractJSON } from "../services/openRouter.service.js";

const getTodayDate = () => new Date().toISOString().split("T")[0]; // YYYY-MM-DD

// 🔥 AI Prompt
const POTD_PROMPT = `
Generate EXACTLY 15 MCQ questions for "Problem of the Day" in JSON format only.

Requirements:
- 5 Aptitude, 5 Reasoning, 5 Verbal Ability
- Mix difficulty: 5 easy, 5 medium, 5 hard
- EACH question MUST have:
  * question
  * options (4)
  * answer
  * explanation
  * category
  * difficulty

Return ONLY valid JSON.
`;


// ================= GENERATE POTD =================
export const generatePotd = asyncHandler(async (req, res) => {
  const today = getTodayDate();

  // Already exists
  let potd = await Potd.findOne({ date: today });
  if (potd) {
    return res.status(200).json({
      success: true,
      message: "POTD already generated",
      data: potd,
    });
  }

  // AI Generate
  const aiResponse = await askAi([{ role: "user", content: POTD_PROMPT }]);
  const data = extractJSON(aiResponse);

  if (!data.questions || data.questions.length !== 15) {
    return res.status(500).json({
      success: false,
      message: "Invalid AI response",
    });
  }

  // Save
  potd = await Potd.create({
    date: today,
    questions: data.questions,
  });

  return res.status(201).json({
    success: true,
    message: "POTD generated successfully",
    data: potd,
  });
});


// ================= GET TODAY POTD =================
export const getTodayPotd = asyncHandler(async (req, res) => {
  const today = getTodayDate();

  let potd = await Potd.findOne({ date: today });

  // 🔥 Auto generate if not exists (SAFE WAY)
  if (!potd) {
    const aiResponse = await askAi([{ role: "user", content: POTD_PROMPT }]);
    const data = extractJSON(aiResponse);

    if (!data.questions || data.questions.length !== 15) {
      return res.status(500).json({
        success: false,
        message: "Failed to auto-generate POTD",
      });
    }

    potd = await Potd.create({
      date: today,
      questions: data.questions,
    });
  }

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

  const potd = await Potd.findOne({ date: today });
  if (!potd) {
    return res.status(404).json({
      success: false,
      message: "No POTD found",
    });
  }

  if (!Array.isArray(answers) || answers.length !== 15) {
    return res.status(400).json({
      success: false,
      message: "Submit exactly 15 answers",
    });
  }

  let score = 0;
  let xpEarned = 0;

  const results = [];
  const categoryStats = {
    aptitude: { correct: 0, total: 0 },
    reasoning: { correct: 0, total: 0 },
    verbal: { correct: 0, total: 0 },
  };

  potd.questions.forEach((q, index) => {
    const userAnswer = answers[index]?.selected;
    const isCorrect = userAnswer === q.answer;

    if (isCorrect) {
      score++;
      const xp =
        q.difficulty === "easy"
          ? 5
          : q.difficulty === "medium"
          ? 10
          : 20;

      xpEarned += xp;
    }

    categoryStats[q.category].total++;
    if (isCorrect) categoryStats[q.category].correct++;

    results.push({
      question: q.question,
      userAnswer,
      correctAnswer: q.answer,
      isCorrect,
      explanation: q.explanation,
      difficulty: q.difficulty,
    });
  });

  // Weak Area
  let weakArea = "aptitude";
  let lowestAccuracy = 1;

  Object.entries(categoryStats).forEach(([cat, stats]) => {
    const acc = stats.correct / stats.total;
    if (acc < lowestAccuracy) {
      lowestAccuracy = acc;
      weakArea = cat;
    }
  });

  // Update user
  const user = await User.findById(req.user._id);

  user.xp += xpEarned;
  user.dailyStats = user.dailyStats || [];

  const todayStat = user.dailyStats.find((s) => s.date === today);

  if (todayStat) {
    todayStat.quizzesGiven += 1;
    todayStat.avgScore =
      (todayStat.avgScore * (todayStat.quizzesGiven - 1) + score) /
      todayStat.quizzesGiven;
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