import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";

const LANGUAGE_MAP = {
  javascript: 63,
  python: 71,
  "c++": 54,
  java: 62
};

export const runCode = asyncHandler(async (req, res) => {
  console.log("📥 Received body:", req.body);  // DEBUG: Check if input is received

  const { code, language, input = "" } = req.body;
  console.log("🔧 Processing:", { language, hasInput: !!input, inputLen: input.length });  // DEBUG

  if (!code || !language) {
    return res.status(400).json({
      success: false,
      message: "Code and language are required"
    });
  }

  const langId = LANGUAGE_MAP[language.toLowerCase()];

  if (!langId) {
    return res.status(400).json({
      success: false,
      message: "Unsupported language"
    });
  }

  try {
    // ✅ ENCODE
    const encodedCode = Buffer.from(code).toString("base64");
    const encodedInput = Buffer.from(input).toString("base64");  // 🔥 FIX: Encode input

    console.log("🚀 Judge0 call with stdin len:", encodedInput.length);  // DEBUG

    const response = await axios.post(
      "https://ce.judge0.com/submissions/?base64_encoded=true&wait=true",
      {
        source_code: encodedCode,
        language_id: langId,
        stdin: encodedInput  // 🔥 FIX: Pass input to stdin
      }
    );

    console.log("📤 Judge0 raw response:", response.data);  // DEBUG: Raw Judge0 response

    const result = response.data;

    // ✅ DECODE OUTPUT
    const decode = (data) =>
      data ? Buffer.from(data, "base64").toString("utf-8") : "";

    const output = 
      decode(result.stdout) ||
      decode(result.stderr) || 
      decode(result.compile_output) ||
      "No output";

    console.log("📤 Final processed output:", output);  // DEBUG: Final output

    res.status(200).json({
      success: true,
      output,
      status: result.status?.description,
      time: result.time,
      memory: result.memory || "N/A"
    });

  } catch (error) {
    console.error("Compiler error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Compilation failed",
      error: error.response?.data || error.message
    });
  }
});

