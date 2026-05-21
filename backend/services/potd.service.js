import Potd from "../models/Potd.js";
import { askAi, extractJSON } from "./openRouter.service.js";

// ================= INTERVAL =================
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * FULL STRUCTURED FALLBACK (15 QUESTIONS)
 */
const FULL_FALLBACK_QUESTIONS = [
  {
    question: "If 12 men can complete a work in 8 days, how many days will 6 men take?",
    options: ["16", "12", "10", "8"],
    answer: "16",
    explanation: "Work inversely proportional to men",
    category: "aptitude",
    difficulty: "easy",
  },
  {
    question: "A train travels 60 km in 1 hour. What is its speed in m/s?",
    options: ["16.66", "20", "10", "25"],
    answer: "16.66",
    explanation: "60 km/h = 16.66 m/s",
    category: "aptitude",
    difficulty: "easy",
  },
  {
    question: "Find compound interest on 1000 at 10% for 2 years.",
    options: ["210", "200", "220", "215"],
    answer: "210",
    explanation: "CI = 210",
    category: "aptitude",
    difficulty: "medium",
  },
  {
    question: "If ratio of A:B is 3:4 and sum is 28, find A.",
    options: ["12", "16", "8", "20"],
    answer: "12",
    explanation: "A = 12",
    category: "aptitude",
    difficulty: "medium",
  },
  {
    question: "Pipe A fills tank in 10h, B in 20h. Together?",
    options: ["6.66h", "5h", "10h", "15h"],
    answer: "6.66h",
    explanation: "Time = 20/3",
    category: "aptitude",
    difficulty: "hard",
  },

  {
    question: "Find next: 2, 4, 8, 16, ?",
    options: ["18", "32", "24", "30"],
    answer: "32",
    explanation: "×2 pattern",
    category: "reasoning",
    difficulty: "easy",
  },
  {
    question: "Odd one out: Apple, Mango, Carrot, Banana",
    options: ["Apple", "Mango", "Carrot", "Banana"],
    answer: "Carrot",
    explanation: "Vegetable",
    category: "reasoning",
    difficulty: "easy",
  },
  {
    question: "If CAT = 24, DOG = ?",
    options: ["26", "27", "28", "29"],
    answer: "26",
    explanation: "Letter sum logic",
    category: "reasoning",
    difficulty: "medium",
  },
  {
    question: "Find missing: 3, 9, 27, ?, 243",
    options: ["54", "81", "72", "90"],
    answer: "81",
    explanation: "×3 pattern",
    category: "reasoning",
    difficulty: "medium",
  },
  {
    question: "Clock shows 3:15, angle?",
    options: ["0°", "7.5°", "15°", "30°"],
    answer: "7.5°",
    explanation: "Hour hand shift",
    category: "reasoning",
    difficulty: "hard",
  },

  {
    question: "Synonym of 'Happy'",
    options: ["Sad", "Joyful", "Angry", "Tired"],
    answer: "Joyful",
    explanation: "Meaning same",
    category: "verbal",
    difficulty: "easy",
  },
  {
    question: "Antonym of 'Fast'",
    options: ["Quick", "Rapid", "Slow", "Speed"],
    answer: "Slow",
    explanation: "Opposite",
    category: "verbal",
    difficulty: "easy",
  },
  {
    question: "Choose correct: He ___ going to school.",
    options: ["is", "are", "am", "be"],
    answer: "is",
    explanation: "He → is",
    category: "verbal",
    difficulty: "medium",
  },
  {
    question: "Meaning of 'Eloquent'",
    options: ["Silent", "Fluent", "Angry", "Weak"],
    answer: "Fluent",
    explanation: "Good speaker",
    category: "verbal",
    difficulty: "medium",
  },
  {
    question: "Error: She don't like coffee.",
    options: ["She", "don't", "like", "coffee"],
    answer: "don't",
    explanation: "Should be doesn't",
    category: "verbal",
    difficulty: "hard",
  },
];

const POTD_PROMPT = `
You are an expert aptitude test generator.

Generate EXACTLY 15 MCQ questions in STRICT JSON format.

Rules:
- 5 aptitude, 5 reasoning, 5 verbal
- 5 easy, 5 medium, 5 hard

Each question must contain:
- question
- options (4)
- answer
- explanation
- category
- difficulty

Return ONLY raw JSON.
No markdown.

{
  "questions": [...]
}
`;

const isValidQuestion = (q) => {
  return (
    q &&
    q.question &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    q.answer &&
    q.explanation &&
    q.category &&
    q.difficulty
  );
};

export const getOrCreateTodayPotd = async () => {
  console.log(" [POTD-SVC] Monthly check...");

  const now = new Date();

  // ================= CHECK LAST 30 DAYS =================
  const thirtyDaysAgo = new Date(now.getTime() - MONTH_MS);

  let potd = await Potd.findOne({
    createdAt: { $gte: thirtyDaysAgo },
  }).sort({ createdAt: -1 });

  // ================= MANUAL ENTRY =================
  if (potd?.isManual) {
    console.log(" [POTD-SVC] Manual monthly POTD found");
    return potd;
  }

  // ================= EXISTING REUSE =================
  if (potd) {
    console.log(" [POTD-SVC] Existing monthly POTD reused");
    return potd;
  }

  console.log(" [POTD-SVC] Generating new monthly POTD...");

  try {
    let questions = [];

    // ================= AI TRY (3 TIMES) =================
    for (let i = 0; i < 3; i++) {
      const aiResponse = await askAi([
        {
          role: "user",
          content: POTD_PROMPT,
        },
      ]);

      const data = extractJSON(aiResponse);

      const validQuestions = (data?.questions || []).filter(isValidQuestion);

      if (validQuestions.length >= 8) {
        questions = validQuestions;
        break;
      }

      console.log(` [POTD-SVC] Retry ${i + 1}: received ${validQuestions.length}`);
    }

    // ================= EXTRA AI FILL =================
    if (questions.length > 0 && questions.length < 15) {
      try {
        const extraRes = await askAi([
          {
            role: "user",
            content: `Generate ${15 - questions.length} more MCQs in same raw JSON format only.`,
          },
        ]);

        const extraData = extractJSON(extraRes);

        const extraQuestions = (extraData?.questions || []).filter(isValidQuestion);

        questions = [...questions, ...extraQuestions];
      } catch {
        console.log(" [POTD-SVC] Extra AI fill failed");
      }
    }

    // ================= FALLBACK FILL =================
    if (questions.length < 15) {
      console.log(" [POTD-SVC] Using fallback fill");

      const needed = 15 - questions.length;

      questions = [...questions, ...FULL_FALLBACK_QUESTIONS.slice(0, needed)];
    }

    // Ensure exactly 15
    questions = questions.slice(0, 15);

    // ================= SAVE =================
    potd = await Potd.create({
      date: now.toISOString().split("T")[0],
      questions,
      generatedAt: now,
    });

    console.log(` [POTD-SVC] Saved monthly ${potd._id}`);

    return potd;
  } catch (error) {
    console.error(" [POTD-SVC] AI failed:", error.message);

    console.log(" [POTD-SVC] Using full fallback questions");

    const fallbackPotd = await Potd.create({
      date: now.toISOString().split("T")[0],
      questions: FULL_FALLBACK_QUESTIONS,
      generatedAt: now,
      isManual: true,
    });

    console.log(" [POTD-SVC] Fallback POTD saved");

    return fallbackPotd;
  }
};

// ================= MANUAL GENERATE =================
export const generateTodayPotd = async () => {
  await Potd.deleteMany({});
  return await getOrCreateTodayPotd();
};
