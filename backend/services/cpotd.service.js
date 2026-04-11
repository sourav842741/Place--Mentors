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
  let questions = [];

//  retry logic
for (let i = 0; i < 3; i++) {
  const aiResponse = await askAi([{ role: "user", content: CPOTD_PROMPT }]);
  const data = extractJSON(aiResponse);

  if (data?.questions && data.questions.length === 2) {
    questions = data.questions;
    break;
  }

  console.log(`[CPOTD] Retry ${i + 1}: got ${data?.questions?.length || 0}`);
}

// 🔥 fallback (kabhi fail nahi hoga)
if (questions.length < 2) {
  const needed = 2 - questions.length;

  console.log(`Filling ${needed} missing coding problems...`);

  const extraRes = await askAi([
    {
      role: "user",
      content: `Generate ONLY ${needed} coding problems in same JSON format. Return JSON only.`,
    },
  ]);

  const extraData = extractJSON(extraRes);

  questions = [...questions, ...(extraData?.questions || [])];
}


questions = questions.slice(0, 2);

// Atomic upsert
cpotd = await CodingPotd.findOneAndUpdate(
  { date: today },
  {
    date: today,
    questions: questions,
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


  // Manual trigger (idempotent)

export const generateTodayCpotd = async () => {
  return await getOrCreateTodayCpotd();
};

