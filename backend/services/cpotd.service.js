import CodingPotd from "../models/CodingPotd.js";
import { askAi, extractJSON } from "./openRouter.service.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * -----------------------------------------
 * STATIC FALLBACK QUESTIONS (GUARANTEED)
 * -----------------------------------------
 */
const CODING_FALLBACK = [
  {
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    inputFormat: "nums = [int array], target = int",
    outputFormat: "Return indices [i, j]",
    constraints: "2 ≤ nums.length ≤ 10^4",
    sampleTestCases: [
      {
        input: "nums = [2,7,11,15], target = 9",
        expectedOutput: "[0,1]",
      },
    ],
    hiddenTestCases: [
      {
        input: "nums = [3,2,4], target = 6",
        expectedOutput: "[1,2]",
      },
      {
        input: "nums = [3,3], target = 6",
        expectedOutput: "[0,1]",
      },
    ],
    difficulty: "easy",
    solutionExplanation:
      "Use hashmap to store visited values and check complement.",
  },
  {
    title: "Number of Islands",
    description:
      "Given a 2D grid of 1s and 0s, count number of islands.",
    inputFormat: "grid = 2D array",
    outputFormat: "Return integer",
    constraints: "1 ≤ rows, cols ≤ 300",
    sampleTestCases: [
      {
        input: "grid = [[1,1,0],[1,1,0],[0,0,1]]",
        expectedOutput: "2",
      },
    ],
    hiddenTestCases: [
      {
        input: "grid = [[1,0,1],[0,1,0],[1,0,1]]",
        expectedOutput: "5",
      },
    ],
    difficulty: "medium",
    solutionExplanation:
      "Use DFS/BFS to mark connected land cells.",
  },
];

const CPOTD_PROMPT = `
Generate EXACTLY 2 coding interview problems in VALID JSON only.

Rules:
1. Problem 1 = Easy or Medium (array/string/hashmap)
2. Problem 2 = Medium or Hard (tree/graph/dp)
3. Include fields:
title
description
inputFormat
outputFormat
constraints
sampleTestCases [{input, expectedOutput}]
hiddenTestCases [{input, expectedOutput}]
difficulty
solutionExplanation

Return ONLY:

{
  "questions": [...]
}
`;

/**
 * -----------------------------------------
 * HELPERS
 * -----------------------------------------
 */

const safeString = (value = "") => {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

const normalizeDifficulty = (value = "easy") => {
  const val = String(value).toLowerCase().trim();

  if (["easy", "medium", "hard"].includes(val)) {
    return val;
  }

  if (val.includes("med")) return "medium";
  if (val.includes("har")) return "hard";

  return "easy";
};

const normalizeCases = (arr = [], isSample = false) => {
  if (!Array.isArray(arr)) return [];

  return arr.map((item) => ({
    input: safeString(item?.input ?? ""),
    expectedOutput: safeString(
      item?.expectedOutput ?? item?.output ?? ""
    ),
    isSample,
  }));
};

const normalizeQuestions = (questions = []) => {
  return questions.map((q, index) => ({
    title: q?.title || `Problem ${index + 1}`,

    description:
      q?.description || "Solve the problem efficiently.",

    inputFormat:
      q?.inputFormat || "Read input from standard input.",

    outputFormat:
      q?.outputFormat || "Print the required output.",

    constraints: q?.constraints || "N/A",

    sampleTestCases: normalizeCases(
      q?.sampleTestCases,
      true
    ),

    hiddenTestCases: normalizeCases(
      q?.hiddenTestCases,
      false
    ),

    difficulty: normalizeDifficulty(q?.difficulty),

    solutionExplanation:
      q?.solutionExplanation || "",
  }));
};

const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

const askAiForQuestions = async () => {
  const response = await askAi([
    { role: "user", content: CPOTD_PROMPT },
  ]);

  const data = extractJSON(response);

  if (!data?.questions || !Array.isArray(data.questions)) {
    return [];
  }

  return data.questions;
};

/**
 * -----------------------------------------
 * MAIN SERVICE
 * -----------------------------------------
 */

export const getOrCreateTodayCpotd = async () => {
  console.log(" [CPOTD-SVC] Weekly check...");

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - WEEK_MS);

  /**
   * If already generated in last 7 days -> reuse
   */
  let existing = await CodingPotd.findOne({
    createdAt: { $gte: sevenDaysAgo },
  }).sort({ createdAt: -1 });

  if (existing?.isManual) {
    console.log(
      " [CPOTD-SVC] Manual weekly CPOTD found"
    );
    return existing;
  }

  if (existing) {
    console.log(
      " [CPOTD-SVC] Existing weekly CPOTD reused"
    );
    return existing;
  }

  console.log(
    " [CPOTD-SVC] Generating new weekly CPOTD..."
  );

  try {
    let questions = [];

    /**
     * Retry AI 3 times
     */
    for (let i = 1; i <= 3; i++) {
      try {
        const aiQuestions = await askAiForQuestions();

        if (aiQuestions.length >= 2) {
          questions = aiQuestions;
          break;
        }

        if (aiQuestions.length > 0) {
          questions = aiQuestions;
        }

        console.log(
          ` [CPOTD-SVC] Retry ${i}: received ${aiQuestions.length}`
        );
      } catch (err) {
        console.log(
          ` [CPOTD-SVC] Retry ${i} failed`
        );
      }
    }

    /**
     * Fill remaining from fallback
     */
    if (questions.length < 2) {
      const need = 2 - questions.length;

      questions = [
        ...questions,
        ...CODING_FALLBACK.slice(0, need),
      ];
    }

    /**
     * Keep only 2 and sanitize
     */
    questions = normalizeQuestions(
      questions.slice(0, 2)
    );

    /**
     * Avoid duplicate same date
     */
    const today = getTodayDate();

    await CodingPotd.deleteMany({
      date: today,
    });

    /**
     * Create
     */
    const cpotd = await CodingPotd.create({
      date: today,
      questions,
      generatedAt: now,
      isManual: false,
    });

    console.log(
      ` [CPOTD-SVC] Saved weekly ${cpotd._id}`
    );

    return cpotd;
  } catch (error) {
    console.error(
      " [CPOTD-SVC] Weekly generation failed:",
      error.message
    );

    /**
     * Emergency fallback create
     */
    const today = getTodayDate();

    await CodingPotd.deleteMany({
      date: today,
    });

    const fallback = await CodingPotd.create({
      date: today,
      questions: normalizeQuestions(
        CODING_FALLBACK
      ),
      generatedAt: new Date(),
      isManual: false,
    });

    console.log(
      " [CPOTD-SVC] Emergency fallback saved"
    );

    return fallback;
  }
};

/**
 * -----------------------------------------
 * MANUAL FORCE GENERATE
 * -----------------------------------------
 */
export const generateTodayCpotd = async () => {
  await CodingPotd.deleteMany({});
  return await getOrCreateTodayCpotd();
};