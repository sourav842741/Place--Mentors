import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { addXP } from "../utils/xpManager.js";
import {
  getOrCreateTodayPotd,
  generateTodayPotd,
} from "../services/potd.service.js";

const getTodayDate = () => new Date().toISOString().split("T")[0]; // YYYY-MM-DD

const POTD_PROMPT = `
You are an expert aptitude test generator.

Generate EXACTLY 15 MCQ questions in STRICT JSON format.

## Rules:
- Total 15 questions
- 5 aptitude, 5 reasoning, 5 verbal
- Difficulty:
  - 5 easy
  - 5 medium
  - 5 hard

## VERY IMPORTANT:
- Return ONLY valid JSON
- No explanation outside JSON

Each question MUST have:
- question (string)
- options (array of 4 strings)
- answer (must exactly match one option)
- explanation (short)
- category (MUST be EXACTLY one of: "aptitude", "reasoning", "verbal")
- difficulty (MUST be EXACTLY one of: "easy", "medium", "hard")

## DO NOT USE:
- "Aptitude"
- "Verbal Ability"
- "Reasoning Skills"
- Any variation

## Output format:
{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "short explanation",
      "category": "aptitude",
      "difficulty": "easy"
    }
  ]
}

Ensure:
- EXACTLY 15 questions
- Each category appears exactly 5 times
- Each difficulty appears exactly 5 times

Now generate.
`;

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
      typeof answers[index] === "object"
        ? answers[index]?.selected
        : answers[index];

    const isCorrect = userAnswer === q.answer;

    const category = normalizeCategory(q.category);

    //  XP + score
    if (isCorrect) {
      score++;

      const xp =
        q.difficulty === "easy" ? 5 : q.difficulty === "medium" ? 10 : 20;

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

  addXP(user, xpEarned, "potd");

  //  daily stats
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
