import Potd from "../models/Potd.js";
import { askAi, extractJSON } from "./openRouter.service.js";

const getTodayDate = () => new Date().toISOString().split("T")[0];

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

/**
 * Get or create today's POTD (idempotent, self-healing)
 */
export const getOrCreateTodayPotd = async () => {
  const today = getTodayDate();
  console.log(` [POTD-SVC] Checking ${today}...`);

  // Atomic check & create
  let potd = await Potd.findOne({ date: today });
  if (potd) {
    console.log(` [POTD-SVC] Found existing for ${today}`);
    return potd;
  }

  console.log(` [POTD-SVC] Generating for ${today}...`);
  try {
 let questions = [];

for (let i = 0; i < 3; i++) {
  const aiResponse = await askAi([{ role: "user", content: POTD_PROMPT }]);
  const data = extractJSON(aiResponse);

  if (data.questions && data.questions.length === 15) {
    questions = data.questions;
    break;
  }

  console.log(`Retry ${i + 1}: got ${data.questions?.length}`);
}

//  fallback (kabhi fail nahi hoga)
if (questions.length < 15) {
  const needed = 15 - questions.length;

  console.log(`Filling ${needed} missing questions...`);

  const extraRes = await askAi([
    {
      role: "user",
      content: `Generate ONLY ${needed} MCQ questions in same JSON format. Return JSON only.`,
    },
  ]);

  const extraData = extractJSON(extraRes);

  questions = [...questions, ...(extraData.questions || [])];
}

// final safety
questions = questions.slice(0, 15);

    // Atomic upsert
  potd = await Potd.findOneAndUpdate(
  { date: today },
  {
    date: today,
    questions: questions,   
    generatedAt: new Date(),
  },
  { upsert: true, returnDocument: "after" }  
);

    console.log(` [POTD-SVC] Generated & saved ${potd._id}`);
    return potd;
  } catch (error) {
    console.error(` [POTD-SVC] Generation failed:`, error.message);
    throw error;
  }
};

/**
 * Manual force-generate (still idempotent)
 */
export const generateTodayPotd = async () => {
  return await getOrCreateTodayPotd(); // Same logic for simplicity/compat
};
