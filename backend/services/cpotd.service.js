import CodingPotd from "../models/CodingPotd.js";
import { askAi, extractJSON } from "./openRouter.service.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 *  HARD FALLBACK CODING QUESTIONS (GUARANTEED)
 */
const CODING_FALLBACK = [
  {
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    inputFormat: "nums = [int array], target = int",
    outputFormat: "Return indices [i, j]",
    constraints: "2 ≤ nums.length ≤ 10^4, -10^9 ≤ nums[i] ≤ 10^9",
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
      "Use hashmap to store visited numbers and check complement.",
  },
  {
    title: "Number of Islands",
    description:
      "Given a 2D grid of '1's (land) and '0's (water), count the number of islands.",
    inputFormat: "grid = 2D array",
    outputFormat: "Return integer count",
    constraints: "1 ≤ grid.length, grid[i].length ≤ 300",
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
      {
        input: "grid = [[1,1,1],[0,1,0],[1,1,1]]",
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

Return ONLY valid JSON:
{
  "questions": [...]
}
`;

export const getOrCreateTodayCpotd = async () => {
  console.log(" [CPOTD-SVC] Weekly check...");

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - WEEK_MS);

  //  If any CPOTD exists in last 7 days, reuse it
  let cpotd = await CodingPotd.findOne({
    createdAt: { $gte: sevenDaysAgo },
  }).sort({ createdAt: -1 });

  if (cpotd?.isManual) {
    console.log(" [CPOTD-SVC] Manual weekly CPOTD found");
    return cpotd;
  }

  if (cpotd) {
    console.log(" [CPOTD-SVC] Existing weekly CPOTD reused");
    return cpotd;
  }

  console.log(" [CPOTD-SVC] Generating new weekly CPOTD...");

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
        `[CPOTD-SVC] Retry ${i + 1}: got ${
          data?.questions?.length || 0
        }`
      );
    }

    //  AI extra fill
    if (questions.length < 2) {
      const needed = 2 - questions.length;

      try {
        const extraRes = await askAi([
          {
            role: "user",
            content: `Generate ONLY ${needed} coding problems in same JSON format. Return JSON only.`,
          },
        ]);

        const extraData = extractJSON(extraRes);

        questions = [...questions, ...(extraData?.questions || [])];
      } catch (error) {
        console.log(
          " [CPOTD-SVC] AI fallback failed, using static fallback"
        );
      }
    }

    //  Final fallback
    if (questions.length < 2) {
      const needed = 2 - questions.length;
      questions = [
        ...questions,
        ...CODING_FALLBACK.slice(0, needed),
      ];
    }

    questions = questions.slice(0, 2);

    //  create new weekly record
    cpotd = await CodingPotd.create({
      date: now.toISOString().split("T")[0],
      questions,
      generatedAt: now,
    });

    console.log(` [CPOTD-SVC] Saved weekly ${cpotd._id}`);
    return cpotd;
  } catch (error) {
    console.error(
      " [CPOTD-SVC] Weekly generation failed:",
      error.message
    );
    throw error;
  }
};

//  Manual trigger = force new weekly CPOTD
export const generateTodayCpotd = async () => {
  await CodingPotd.deleteMany({});
  return await getOrCreateTodayCpotd();
};