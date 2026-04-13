import CodingPotd from "../models/CodingPotd.js";
import { askAi, extractJSON } from "./openRouter.service.js";

const getTodayDate = () => new Date().toISOString().split("T")[0];

/**
 * 🔥 HARD FALLBACK CODING QUESTIONS (GUARANTEED)
 */
const CODING_FALLBACK = [
  {
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    inputFormat: "nums = [int array], target = int",
    outputFormat: "Return indices [i, j]",
    constraints:
      "2 ≤ nums.length ≤ 10^4, -10^9 ≤ nums[i] ≤ 10^9",
    sampleTestCases: [
      { input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]" },
    ],
    hiddenTestCases: [
      { input: "nums = [3,2,4], target = 6", expectedOutput: "[1,2]" },
      { input: "nums = [3,3], target = 6", expectedOutput: "[0,1]" },
    ],
    difficulty: "easy",
    solutionExplanation:
      "Use hashmap to store visited numbers and check complement.",
  },
  {
    title: "Number of Islands",
    description:
      "Given a 2D grid of '1's (land) and '0's (water), count the number of islands.",
    inputFormat: "grid = 2D array",
    outputFormat: "Return integer count",
    constraints:
      "1 ≤ grid.length, grid[i].length ≤ 300",
    sampleTestCases: [
      {
        input:
          "grid = [[1,1,0],[1,1,0],[0,0,1]]",
        expectedOutput: "2",
      },
    ],
    hiddenTestCases: [
      {
        input:
          "grid = [[1,0,1],[0,1,0],[1,0,1]]",
        expectedOutput: "5",
      },
      {
        input:
          "grid = [[1,1,1],[0,1,0],[1,1,1]]",
        expectedOutput: "1",
      },
    ],
    difficulty: "medium",
    solutionExplanation:
      "Use DFS/BFS to mark visited land cells.",
  },
];

const CPOTD_PROMPT = `
Generate EXACTLY 2 coding problems for "Coding Problem of the Day" in JSON format only.

Requirements:
- Problem 1: Easy/Medium (array/strings)
- Problem 2: Medium/Hard (trees/graphs/DP)
- EACH problem MUST have:
  * title
  * description  
  * inputFormat
  * outputFormat
  * constraints
  * sampleTestCases: [{input, expectedOutput}]
  * hiddenTestCases: 2-3 more
  * difficulty
  * solutionExplanation

Return ONLY valid JSON: { "questions": [...] }
`;

export const getOrCreateTodayCpotd = async () => {
  const today = getTodayDate();
  console.log(` [CPOTD-SVC] Checking ${today}...`);

  let cpotd = await CodingPotd.findOne({ date: today });
  if (cpotd?.isManual) {
    console.log(` [CPOTD-SVC] Manual override found for ${today}`);
    return cpotd;
  }
  if (cpotd) {
    console.log(` [CPOTD-SVC] Found existing auto for ${today}`);
    return cpotd;
  }

  console.log(` [CPOTD-SVC] Generating for ${today}...`);

  try {
    let questions = [];

    //  Retry AI 3 times
    for (let i = 0; i < 3; i++) {
      const aiResponse = await askAi([
        { role: "user", content: CPOTD_PROMPT },
      ]);

      const data = extractJSON(aiResponse);

      if (data?.questions?.length === 2) {
        questions = data.questions;
        break;
      }

      console.log(
        `[CPOTD] Retry ${i + 1}: got ${data?.questions?.length || 0}`
      );
    }

    //  AI fallback try
    if (questions.length < 2) {
      const needed = 2 - questions.length;

      console.log(`Filling ${needed} missing coding problems...`);

      try {
        const extraRes = await askAi([
          {
            role: "user",
            content: `Generate ONLY ${needed} coding problems in same JSON format. Return JSON only.`,
          },
        ]);

        const extraData = extractJSON(extraRes);

        questions = [...questions, ...(extraData?.questions || [])];
      } catch (err) {
        console.log("AI fallback failed, switching to static fallback...");
      }
    }

    //  FINAL HARD FALLBACK (GUARANTEED)
    if (questions.length < 2) {
      const needed = 2 - questions.length;

      console.log(`Adding ${needed} fallback coding problems...`);

      const extraFallback = CODING_FALLBACK.slice(0, needed);

      questions = [...questions, ...extraFallback];
    }

    //  FINAL SAFETY
    questions = questions.slice(0, 2);

    //  Atomic upsert
    cpotd = await CodingPotd.findOneAndUpdate(
      { date: today },
      {
        date: today,
        questions,
        generatedAt: new Date(),
      },
      { upsert: true, returnDocument: "after" }
    );

    console.log(` [CPOTD-SVC] Generated & saved ${cpotd._id}`);
    return cpotd;
  } catch (error) {
    console.error(` [CPOTD-SVC] Generation failed:`, error.message);
    throw error;
  }
};

//  Manual trigger
export const generateTodayCpotd = async () => {
  return await getOrCreateTodayCpotd();
};