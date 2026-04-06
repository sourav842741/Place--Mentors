import axios from "axios";

export const generateAI = async (prompt) => {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Invalid Gemini response");

    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      return JSON.parse(cleanText);
    } catch {
      return cleanText;
    }

  } catch (err) {
    console.log("Gemini failed, fallback...");

    const fallback = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      }
    );

    const fallbackText = fallback.data.choices[0].message.content;

    const cleanFallback = fallbackText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleanFallback);
    } catch {
      return cleanFallback;
    }
  }
};