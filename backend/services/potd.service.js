import Potd from "../models/Potd.js";
import { askAi, extractJSON } from "./openRouter.service.js";

const getTodayDate = () => new Date().toISOString().split("T")[0];

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

Return ONLY valid JSON: { "questions": [...] }
`;

/**
 * Get or create today's POTD (idempotent, self-healing)
 */
export const getOrCreateTodayPotd = async () => {
  const today = getTodayDate();
  console.log(`🔄 [POTD-SVC] Checking ${today}...`);

  // Atomic check & create
  let potd = await Potd.findOne({ date: today });
  if (potd) {
    console.log(`✅ [POTD-SVC] Found existing for ${today}`);
    return potd;
  }

  console.log(`🤖 [POTD-SVC] Generating for ${today}...`);
  try {
    const aiResponse = await askAi([{ role: "user", content: POTD_PROMPT }]);
    const data = extractJSON(aiResponse);

    if (!data.questions || data.questions.length !== 15) {
      throw new Error(`Invalid AI response: expected 15 questions, got ${data.questions?.length || 0}`);
    }

    // Atomic upsert
    potd = await Potd.findOneAndUpdate(
      { date: today },
      { 
        date: today,
        questions: data.questions,
        generatedAt: new Date()
      },
      { upsert: true, new: true }
    );

  console.log(`✅ [POTD-SVC] Generated & saved ${potd._id}`);
    return potd;
  } catch (error) {
    console.error(`❌ [POTD-SVC] Generation failed:`, error.message);
    throw error;
  }
};


/**
 * Manual force-generate (still idempotent)
 */
export const generateTodayPotd = async () => {
  return await getOrCreateTodayPotd(); // Same logic for simplicity/compat
};

