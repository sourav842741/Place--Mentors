import axios from "axios";

export const askAi = async (messages) => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages invalid");
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY missing");
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "PlaceMentor Support AI"
        },
        timeout: 30000
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Empty AI response");
    }

    return content;

  } catch (error) {
    console.error("OpenRouter Error:");
    console.error(error.response?.data || error.message);
    return null;
  }
};

// ================= SAFE JSON =================
export const extractJSON = (response) => {
  try {
    if (!response || typeof response !== "string") return null;

    // Try code block JSON
    const match =
      response.match(/```json\s*([\s\S]*?)\s*```/) ||
      response.match(/\{[\s\S]*\}/);

    if (match) {
      const jsonStr = match[1] || match[0];
      return JSON.parse(jsonStr.trim());
    }

    return null;
  } catch (err) {
    console.error(" JSON parse failed");
    return null;
  }
};