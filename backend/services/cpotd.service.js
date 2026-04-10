import CodingPotd from "../models/CodingPotd.js";
import { askAi, extractJSON } from "./openRouter.service.js";

const getTodayDate = () => new Date().toISOString().split("T")[0];

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

/**
 * Get or create today's CPOTD (idempotent)
 */
export const getOrCreateTodayCpotd = async () => {
  const today = getTodayDate();
  console.log(` [CPOTD-SVC] Checking ${today}...`);

  let cpotd = await CodingPotd.findOne({ date: today });
  if (cpotd) {
    console.log(` [CPOTD-SVC] Found existing for ${today}`);
    return cpotd;
  }

  console.log(` [CPOTD-SVC] Generating for ${today}...`);
  try {
    const aiResponse = await askAi([{ role: "user", content: CPOTD_PROMPT }]);
    const data = extractJSON(aiResponse);

    if (!data.questions || data.questions.length !== 2) {
      throw new Error(`Expected 2 coding problems, got ${data.questions?.length || 0}`);
    }

    // Atomic upsert
    cpotd = await CodingPotd.findOneAndUpdate(
      { date: today },
      {
        date: today,
        questions: data.questions,
        generatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(` [CPOTD-SVC] Generated & saved ${cpotd._id}`);
    return cpotd;
  } catch (error) {
    console.error(` [CPOTD-SVC] Generation failed:`, error.message);
    throw error;
  }
};


  // Manual trigger (idempotent)

export const generateTodayCpotd = async () => {
  return await getOrCreateTodayCpotd();
};

