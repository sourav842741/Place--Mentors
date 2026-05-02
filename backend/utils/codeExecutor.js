import axios from "axios";

const LANGUAGE_MAP = {
  javascript: 63,
  python: 71,
  "c++": 54,
  java: 62,
};

//  SAME PARSER (UNCHANGED)
const parseInput = (inputStr) => {
  if (!inputStr) return null;

  const match = inputStr.match(/^\s*\w+\s*=\s*(.*)$/s);
  if (!match) return inputStr.trim();

  const valueStr = match[1].trim();

  try {
    if (valueStr.startsWith("[") || valueStr.startsWith("{")) {
      return JSON.parse(valueStr);
    }
    const func = new Function(`return ${valueStr};`);
    return func();
  } catch {
    return valueStr;
  }
};

const generateSolutionWrapper = (userCode, parsedInput, language) => {
  const inputStr =
    language.toLowerCase() === "java"
      ? JSON.stringify(parsedInput).replace(/\[/g, "{").replace(/\]/g, "}")
      : JSON.stringify(parsedInput);

  switch (language.toLowerCase()) {
    // ================= JS =================
    case "javascript":
      return `
${userCode}

if (typeof solution !== 'function') {
  function solution(input) { throw new Error('solution function not found'); }
}

try {
  const result = solution(${inputStr});
  console.log(JSON.stringify(result === undefined ? null : result));
} catch (e) {
  console.error('Runtime Error: ' + e.message);
}
`;

    case "python":
      return `
import json

${userCode}

try:
  result = solution(${inputStr})
  print(json.dumps(result if result is not None else None))
except Exception as e:
  print("Runtime Error:", e)
`;

    case "java":
      return `
import java.util.*;

${userCode}

public class Main {
  public static void main(String[] args) {
    int[][] input = ${inputStr};

    Solution obj = new Solution();
    int result = obj.numIslands(input);

    System.out.println(result);
  }
}
`;

    case "c++":
      return userCode;

    default:
      throw new Error("Unsupported language");
  }
};

//  EXECUTION FUNCTION (STDIN FIXED)
export const executeCodeWithInput = async (userCode, language, input) => {
  const parsedInput = parseInput(input);
  const wrapperCode = generateSolutionWrapper(userCode, parsedInput, language);

  const langId = LANGUAGE_MAP[language.toLowerCase()];
  if (!langId) throw new Error("Unsupported language");

  try {
    const encodedCode = Buffer.from(wrapperCode).toString("base64");

    const encodedInput = Buffer.from(
      typeof input === "string" ? input : JSON.stringify(parsedInput)
    ).toString("base64");

    const response = await axios.post(
      "https://ce.judge0.com/submissions/?base64_encoded=true&wait=true",
      {
        source_code: encodedCode,
        language_id: langId,
        stdin: encodedInput,
      }
    );

    const result = response.data;

    const decode = (data) => (data ? Buffer.from(data, "base64").toString("utf-8") : "");

    const output =
      decode(result.stdout) || decode(result.stderr) || decode(result.compile_output) || "";

    return {
      success: true,
      output: output.trim(),
      status: result.status?.description,
      time: result.time,
      memory: result.memory || "N/A",
    };
  } catch (error) {
    console.error("Compiler error:", error.response?.data || error.message);
    throw new Error("Compilation failed");
  }
};

//  OLD FUNCTION SAME
export const executeCode = async (code, language, input = "") => {
  const langId = LANGUAGE_MAP[language.toLowerCase()];

  if (!langId) {
    throw new Error("Unsupported language");
  }

  try {
    const encodedCode = Buffer.from(code).toString("base64");
    const encodedInput = Buffer.from(input).toString("base64");

    const response = await axios.post(
      "https://ce.judge0.com/submissions/?base64_encoded=true&wait=true",
      {
        source_code: encodedCode,
        language_id: langId,
        stdin: encodedInput,
      }
    );

    const result = response.data;

    const decode = (data) => (data ? Buffer.from(data, "base64").toString("utf-8") : "");

    const output =
      decode(result.stdout) ||
      decode(result.stderr) ||
      decode(result.compile_output) ||
      "No output";

    return {
      success: true,
      output,
      status: result.status?.description,
      time: result.time,
      memory: result.memory || "N/A",
    };
  } catch (error) {
    console.error("Compiler error:", error.response?.data || error.message);
    throw new Error("Compilation failed");
  }
};

//  TEST RUNNER SAME
export const executeTests = async ({ code, language, testCases }) => {
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];

    try {
      const execution = await executeCodeWithInput(code, language, tc.input);

      const output = execution.output;

      const passed = String(output).trim() === String(tc.expectedOutput).trim();

      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        got: output,
        passed,
      });
    } catch (err) {
      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        got: "Error",
        passed: false,
      });
    }
  }

  const allPassed = results.every((r) => r.passed);

  return { results, allPassed };
};
