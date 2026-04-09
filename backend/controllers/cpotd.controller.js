import { asyncHandler } from "../utils/asyncHandler.js";
import CodingPotd from "../models/CodingPotd.js";
import User from "../models/user.model.js";
import { askAi, extractJSON } from "../services/openRouter.service.js";
import { addXP } from "../utils/xpManager.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";

const getTodayDate = () => new Date().toISOString().split("T")[0];

const CPOTD_PROMPT = `YOUR SAME PROMPT HERE`;

// ======================
// ✅ SERVICE FUNCTION
// ======================
const generateCpotdService = async () => {
  const today = getTodayDate();

  let cpotd = await CodingPotd.findOne({ date: today });
  if (cpotd) return cpotd;

  const aiResponse = await askAi([
    { role: "user", content: CPOTD_PROMPT },
  ]);

  const data = extractJSON(aiResponse);

  if (!data.questions || data.questions.length !== 2) {
    throw new Error("Expected exactly 2 coding problems");
  }

  cpotd = await CodingPotd.create({
    date: today,
    questions: data.questions,
  });

  return cpotd;
};

// ======================
// ✅ CONTROLLERS
// ======================

// 🔥 Generate CPOTD (manual trigger)
export const generateCpotd = asyncHandler(async (req, res) => {
  const cpotd = await generateCpotdService();

  return res
    .status(201)
    .json(new ApiResponse(201, cpotd, "CPOTD generated"));
});

// 🔥 Get Today CPOTD (auto generate if not exists)
export const getTodayCpotd = asyncHandler(async (req, res) => {
  const cpotd = await generateCpotdService();

  return res.status(200).json(new ApiResponse(200, cpotd));
});

// 🔥 Submit CPOTD
export const submitCpotd = asyncHandler(async (req, res) => {
  const { questionIndex, language, code } = req.body;
  const userId = req.user._id;

  const today = getTodayDate();
  const cpotd = await CodingPotd.findOne({ date: today });

  if (!cpotd || !cpotd.questions[questionIndex]) {
    return res.status(400).json({
      message: "Invalid CPOTD question",
    });
  }

  const question = cpotd.questions[questionIndex];

  const testCases = [
    ...question.sampleTestCases,
    ...question.hiddenTestCases,
  ];

  let passed = 0;
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const executionResult = await executeCodeWithInput(
      code,
      language,
      testCases[i].input
    );

    const passedTest =
      executionResult.output.trim() ===
      testCases[i].expectedOutput.trim();

    if (passedTest) passed++;

    results.push({
      testCase: i + 1,
      input: testCases[i].input,
      expected: testCases[i].expectedOutput,
      got: executionResult.output,
      passed: passedTest,
      ...(executionResult.error && { error: executionResult.error }),
    });
  }

 const score = Math.round((passed / testCases.length) * 100);

const xp = question.difficulty === "easy" ? 50 : 100;

const percentage = passed / testCases.length;

let xpEarned = 0;

if (percentage >= 0.3) {
  xpEarned = Math.floor(xp * percentage);
}

const isAccepted = percentage === 1;

  const user = await User.findById(userId);
  if (user && isAccepted) {
    // 🔥 MARK CPOTD COMPLETED
    const today = new Date().toISOString().split('T')[0];
    user.codingPotdCompleted = true;
    user.lastCodingPotdDate = today;
    
    console.log(`📊 CPOTD XP attempt: +${xpEarned}`);
    addXP(user, xpEarned, "cpotd");
    await user.save();
    console.log(`✅ CPOTD completed & XP saved for ${user.email}`);
  }

  return res.status(200).json({
    success: true,
    data: {
      score,
      passed,
      totalTests: testCases.length,
      results,
      isAccepted,
      xpEarned,
      solutionExplanation: question.solutionExplanation,
    },
  });
});

// ======================
// ✅ CODE EXECUTION
// ======================

const LANGUAGE_MAP = {
  javascript: 63,
  python: 71,
  "c++": 54,
  java: 62,
};

const executeCodeWithInput = async (code, language, input) => {
  const langId = LANGUAGE_MAP[language.toLowerCase()];

  const encodedCode = Buffer.from(code).toString("base64");
  const encodedInput = Buffer.from(input || "").toString("base64");

  const response = await axios.post(
    "https://ce.judge0.com/submissions/?base64_encoded=true&wait=true",
    {
      source_code: encodedCode,
      language_id: langId,
      stdin: encodedInput,
    }
  );

  const result = response.data;

  const decode = (data) =>
    data ? Buffer.from(data, "base64").toString("utf-8") : "";

  return {
    output:
      decode(result.stdout) ||
      decode(result.stderr) ||
      decode(result.compile_output) ||
      "",
    error: decode(result.stderr),
  };
};