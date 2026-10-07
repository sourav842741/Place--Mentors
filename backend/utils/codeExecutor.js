import axios from "axios";

// Primary Judge0 Language IDs
export const LANGUAGE_MAP = {
  // JavaScript
  javascript: 102,
  js: 102,
  node: 102,
  "node.js": 102,

  // TypeScript
  typescript: 101,
  ts: 101,

  // Python
  python: 100,
  python3: 100,
  py: 100,

  // Java
  java: 91,

  // C++
  "c++": 105,
  cpp: 105,

  // C
  c: 103,

  // Go
  go: 107,
  golang: 107,

  // Rust
  rust: 108,
  rs: 108,

  // C#
  "c#": 51,
  csharp: 51,
  cs: 51,

  // PHP
  php: 98,
};

// Fallback Language IDs (older stable Judge0 IDs)
export const FALLBACK_LANGUAGE_MAP = {
  javascript: 63,
  js: 63,
  node: 63,
  "node.js": 63,
  python: 71,
  python3: 71,
  py: 71,
  java: 62,
  "c++": 54,
  cpp: 54,
  c: 50,
  typescript: 74,
  ts: 74,
  go: 60,
  golang: 60,
  rust: 73,
  rs: 73,
};

// Helper to decode Base64 data safely
const decode = (data) => {
  if (!data) return "";
  try {
    return Buffer.from(data, "base64").toString("utf-8");
  } catch (err) {
    return String(data);
  }
};

// Helper to submit code to Judge0 with fallback support
const submitToJudge0 = async (encodedCode, languageKey, encodedInput) => {
  const primaryId = LANGUAGE_MAP[languageKey];
  const fallbackId = FALLBACK_LANGUAGE_MAP[languageKey];

  if (!primaryId && !fallbackId) {
    throw new Error(`Unsupported language: ${languageKey}`);
  }

  const endpoint = "https://ce.judge0.com/submissions/?base64_encoded=true&wait=true";

  try {
    const response = await axios.post(
      endpoint,
      {
        source_code: encodedCode,
        language_id: primaryId || fallbackId,
        stdin: encodedInput,
      },
      { timeout: 25000 }
    );
    return response.data;
  } catch (primaryError) {
    // If primary ID failed and a fallback exists, try fallback
    if (fallbackId && fallbackId !== primaryId) {
      console.warn(`Retrying with fallback language ID ${fallbackId} for ${languageKey}...`);
      const response = await axios.post(
        endpoint,
        {
          source_code: encodedCode,
          language_id: fallbackId,
          stdin: encodedInput,
        },
        { timeout: 25000 }
      );
      return response.data;
    }
    throw primaryError;
  }
};

// SAME PARSER (UNCHANGED)
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
  const lang = (language || "").toLowerCase().trim();
  const inputStr =
    lang === "java"
      ? JSON.stringify(parsedInput).replace(/\[/g, "{").replace(/\]/g, "}")
      : JSON.stringify(parsedInput);

  switch (lang) {
    // ================= JS =================
    case "javascript":
    case "js":
    case "node":
    case "node.js":
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
    case "python3":
    case "py":
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
    case "cpp":
    case "c":
    case "typescript":
    case "ts":
    case "go":
    case "golang":
    case "rust":
    case "rs":
      return userCode;

    default:
      return userCode;
  }
};

// EXECUTION FUNCTION (USED IN CODE TESTS & CHALLENGES)
export const executeCodeWithInput = async (userCode, language, input) => {
  const langKey = (language || "").toLowerCase().trim();
  if (!LANGUAGE_MAP[langKey] && !FALLBACK_LANGUAGE_MAP[langKey]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const parsedInput = parseInput(input);
  const wrapperCode = generateSolutionWrapper(userCode, parsedInput, language);

  try {
    const encodedCode = Buffer.from(wrapperCode).toString("base64");
    const encodedInput = Buffer.from(
      typeof input === "string" ? input : JSON.stringify(parsedInput)
    ).toString("base64");

    const result = await submitToJudge0(encodedCode, langKey, encodedInput);

    const stdout = decode(result.stdout);
    const stderr = decode(result.stderr);
    const compileOutput = decode(result.compile_output);

    const statusId = result.status?.id;
    const isAccepted = statusId === 3;

    let output = "";
    if (compileOutput) {
      output = compileOutput;
    } else if (stderr) {
      output = stderr;
    } else {
      output = stdout || "";
    }

    return {
      success: isAccepted,
      hasError: !isAccepted,
      output: output.trim(),
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      compile_output: compileOutput.trim(),
      status: result.status?.description,
      time: result.time,
      memory: result.memory || "N/A",
    };
  } catch (error) {
    console.error("Compiler error in executeCodeWithInput:", error.response?.data || error.message);
    throw new Error("Compilation failed");
  }
};

// COMPREHENSIVE RUN FUNCTION (USED IN ONLINE CODE COMPILER)
export const executeCode = async (code, language, input = "") => {
  const langKey = (language || "").toLowerCase().trim();

  if (!LANGUAGE_MAP[langKey] && !FALLBACK_LANGUAGE_MAP[langKey]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  try {
    const encodedCode = Buffer.from(code || "").toString("base64");
    const encodedInput = Buffer.from(input || "").toString("base64");

    const result = await submitToJudge0(encodedCode, langKey, encodedInput);

    const stdout = decode(result.stdout);
    const stderr = decode(result.stderr);
    const compileOutput = decode(result.compile_output);

    const statusId = result.status?.id;
    const statusDesc = result.status?.description || "Unknown";

    // Judge0 status: 3 = Accepted
    const isAccepted = statusId === 3;
    const isCompilationError = statusId === 6;
    const isRuntimeError = [7, 8, 9, 10, 11, 12].includes(statusId);
    const isTimeLimit = statusId === 5;
    const isMemoryLimit = statusId === 4;

    let errorCategory = null;
    if (isCompilationError) errorCategory = "Compilation Error";
    else if (isRuntimeError) errorCategory = "Runtime Error";
    else if (isTimeLimit) errorCategory = "Time Limit Exceeded";
    else if (isMemoryLimit) errorCategory = "Memory Limit Exceeded";
    else if (!isAccepted) errorCategory = statusDesc;

    // Combined clean output for terminal display
    let finalOutput = "";
    if (compileOutput) {
      finalOutput = compileOutput.trim();
    } else if (stderr && stdout) {
      finalOutput = `${stdout.trim()}\n\n[Standard Error]:\n${stderr.trim()}`;
    } else if (stderr) {
      finalOutput = stderr.trim();
    } else if (stdout) {
      finalOutput = stdout;
    } else {
      finalOutput = isAccepted
        ? "Program executed successfully with no output."
        : statusDesc;
    }

    return {
      success: isAccepted,
      hasError: !isAccepted,
      errorCategory,
      status: {
        id: statusId,
        description: statusDesc,
      },
      stdout: stdout || "",
      stderr: stderr || "",
      compile_output: compileOutput || "",
      output: finalOutput,
      time: result.time ? `${result.time}s` : "0.00s",
      memory: result.memory ? `${result.memory} KB` : "N/A",
      exitCode: result.exit_code ?? (isAccepted ? 0 : 1),
      exitSignal: result.exit_signal ?? null,
    };
  } catch (error) {
    console.error("executeCode error:", error.response?.data || error.message);
    const errMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Sandbox execution failed";

    return {
      success: false,
      hasError: true,
      errorCategory: "Execution Failed",
      status: {
        id: -1,
        description: "Execution Error",
      },
      stdout: "",
      stderr: errMsg,
      compile_output: "",
      output: `[Sandbox Execution Error]: ${errMsg}`,
      time: "0.00s",
      memory: "N/A",
      exitCode: 1,
      exitSignal: null,
      error: errMsg,
    };
  }
};

// TEST RUNNER FOR TEST CASES
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
