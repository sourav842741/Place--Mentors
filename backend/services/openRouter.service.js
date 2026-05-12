import axios from "axios";
import { withSafetyInstruction, filterSafeContent } from "../utils/contentSafety.js";

export const askAi = async (messages) => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages invalid");
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY missing");
    }

    // Apply safety instruction to system prompts
    const safeMessages = messages.map((msg) => {
      if (msg.role === "system") {
        return { ...msg, content: withSafetyInstruction(msg.content) };
      }
      return msg;
    });

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: safeMessages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
          "X-Title": "PlaceMentor Support AI",
        },
        timeout: 30000,
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Empty AI response");
    }

    // Apply content safety filter
    return filterSafeContent(content, "default");
  } catch (error) {
    console.error("OpenRouter AI Error:", error.response?.data || error.message);

    if (error.response?.status === 402) {
      throw new Error("AI quota exceeded. Please recharge credits.");
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("AI request timeout. Please try again.");
    }

    throw new Error("AI service unavailable right now.");
  }
};

// ================= SAFE JSON =================
export const extractJSON = (response) => {
  try {
    if (!response || typeof response !== "string") return null;

    // Try code block JSON
    const match = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);

    if (match) {
      const jsonStr = match[1] || match[0];
      return JSON.parse(jsonStr.trim());
    }

    return null;
  } catch (err) {
    return null;
  }
};
