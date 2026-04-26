import axios from "axios";
import { withSafetyInstruction, filterSafeContent } from "../utils/contentSafety.js";

export const generateAI = async (prompt) => {
  try {
    const safePrompt = withSafetyInstruction(prompt);

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: safePrompt }] }]
      }
    );

    const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Invalid Gemini response");

    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const safeText = filterSafeContent(cleanText, "coach");

    try {
      return JSON.parse(safeText);
    } catch {
      return safeText;
    }

  } catch (err) {
    const fallback = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: withSafetyInstruction("You are a helpful AI assistant.") },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      }
    );

    const fallbackText = fallback.data.choices[0].message.content;
    const safeFallback = filterSafeContent(
      fallbackText.replace(/```json/g, "").replace(/```/g, "").trim(),
      "coach"
    );

    try {
      return JSON.parse(safeFallback);
    } catch {
      return safeFallback;
    }
  }
};

