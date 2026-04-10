import axios from "axios";

export const askAi = async (messages) => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error(" Messages invalid");
      return ""; 
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;

    if (!content || !content.trim()) {
      console.error(" Empty AI response");
      return ""; 
    }

    return content;
  } catch (error) {
    console.error(
      " OpenRouter Error:",
      error.response?.data || error.message
    );

    return ""; 
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