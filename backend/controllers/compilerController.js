import { asyncHandler } from "../utils/asyncHandler.js";

import { executeCodeWithInput, executeCode } from "../utils/codeExecutor.js";


export const runCodeTests = asyncHandler(async (req, res) => {
  const { code, language, testCases } = req.body;

  if (!code || !language || !testCases || !Array.isArray(testCases)) {
    return res.status(400).json({
      success: false,
      message: "Code, language, and testCases array required",
    });
  }

  const results = [];
  let allPassed = true;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
     const result = await executeCodeWithInput(code, language, tc.input);



const got = result.output !== undefined && result.output !== null
  ? result.output
  : "No output";
      const passed = String(got).trim() === String(tc.expectedOutput).trim();
      
      if (!passed) allPassed = false;
      
      results.push({
        testCase: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        got,
        passed
      });
    } catch (error) {
      allPassed = false;
      results.push({
        testCase: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        got: `Error: ${error.message}`,
        passed: false
      });
    }
  }

  res.status(200).json({
    success: true,
    results,
    allPassed,
    totalPassed: results.filter(r => r.passed).length,
    totalTests: results.length
  });
});

// Legacy /run endpoint
export const runCode = asyncHandler(async (req, res) => {
  const { code, language, input = "" } = req.body;

  if (!code || !language) {
    return res.status(400).json({
      success: false,
      message: "Code and language are required",
    });
  }

  try {
    const result = await executeCode(code, language, input);
    res.status(200).json(result);
  } catch (error) {
    console.error("Compiler error:", error.message);
    res.status(500).json({
      success: false,
      message: "Compilation failed",
      error: error.message,
    });
  }
});
