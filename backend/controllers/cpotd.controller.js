import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { addXP } from "../utils/xpManager.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";
import {
  getOrCreateTodayCpotd,
  generateTodayCpotd,
} from "../services/cpotd.service.js";

const getTodayDate = () => new Date().toISOString().split("T")[0];

//  Generate CPOTD (manual trigger)
export const generateCpotd = asyncHandler(async (req, res) => {
  const cpotd = await generateTodayCpotd();

  return res.status(201).json(new ApiResponse(201, cpotd, "CPOTD generated"));
});

//  Get Today CPOTD (auto generate if not exists)
export const getTodayCpotd = asyncHandler(async (req, res) => {
  const cpotd = await getOrCreateTodayCpotd();

  return res.status(200).json(new ApiResponse(200, cpotd));
});

//  Submit CPOTD
export const submitCpotd = asyncHandler(async (req, res) => {
  const { questionIndex, language, code } = req.body;
  const userId = req.user._id;

  const cpotd = await getOrCreateTodayCpotd();

  if (!cpotd || !cpotd.questions[questionIndex]) {
    return res.status(400).json({
      message: "Invalid CPOTD question",
    });
  }

  const question = cpotd.questions[questionIndex];

  const testCases = [...question.sampleTestCases, ...question.hiddenTestCases];

  let passed = 0;
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const executionResult = await executeCodeWithInput(
      code,
      language,
      testCases[i].input,
    );

    const passedTest =
      executionResult.output.trim() === testCases[i].expectedOutput.trim();

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
    const today = new Date().toISOString().split("T")[0];
    user.codingPotdCompleted = true;
    user.lastCodingPotdDate = today;
    user.lastCodingPotdAt = new Date();

    addXP(user, xpEarned, "cpotd");
    await user.save();
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

//  CODE EXECUTION

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
    },
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

// ================= CPOTD STATUS =================
export const getCpotdStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const now = new Date();
  const limit = 24 * 60 * 60 * 1000;

  const locked =
    user.lastCodingPotdAt &&
    now - user.lastCodingPotdAt < limit;

  const remaining = locked
    ? limit - (now - user.lastCodingPotdAt)
    : 0;

 res.json({
  success: true,
  data: {
    locked,
    remaining,
    solved: user.codingPotdCompleted, 
  },
});
});

// ================= COMPLETE CPOTD (cooldown timer) =================
export const completeCpotd = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.codingPotdCompleted = true;
  user.lastCodingPotdAt = new Date();
  user.lastCodingPotdDate = new Date().toISOString().split("T")[0];
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Coding POTD marked complete, cooldown started",
    data: {
      locked: true,
      unlockAt: new Date(Date.now() + 24*60*60*1000).toISOString(),
    },
  });
});

