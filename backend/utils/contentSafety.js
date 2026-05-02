/**
 * Content Safety Filter
 * Prevents AI from generating abusive, vulgar, or sexual content.
 */

const BLOCKED_PATTERNS = [
  // Vulgar/sexual terms (broad regex patterns)
  /\b(sex|porn|nude|naked|xxx|exploit|abuse)\b/gi,
  /\b(f[u*]ck|b[i*]tch|a[s*]sh[o*]le|d[i*]ck)\b/gi,
  // Additional abusive patterns
  /\b(hate speech|racist|kill yourself|suicide)\b/gi,
];

const SAFE_FALLBACKS = {
  coach:
    "I'm here to help with your placement preparation! 🚀\nLet's focus on building your skills.",
  resume: "Professional Summary:\nExperienced developer with strong technical skills.",
  youtube: "Summary unavailable. Please try with educational content.",
  motivation: "Keep pushing forward! 💪\nEvery step counts toward your goal.",
  default:
    "I'm designed to help with placement preparation and career growth. How can I assist you today?",
};

/**
 * Check if text contains unsafe content.
 */
export const containsUnsafeContent = (text) => {
  if (!text || typeof text !== "string") return false;
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(text));
};

/**
 * Filter AI response to remove unsafe content.
 * Returns safe fallback if content is flagged.
 */
export const filterSafeContent = (text, context = "default") => {
  if (!text || typeof text !== "string") {
    return SAFE_FALLBACKS[context] || SAFE_FALLBACKS.default;
  }

  if (containsUnsafeContent(text)) {
    return SAFE_FALLBACKS[context] || SAFE_FALLBACKS.default;
  }

  return text;
};

/**
 * Append safety instruction to AI system prompts.
 */
export const withSafetyInstruction = (systemPrompt) => {
  const safetyInstruction = `

===============================================
CONTENT SAFETY POLICY (STRICT)
===============================================
You MUST NEVER produce content that is:
- Sexually explicit or suggestive
- Abusive, hateful, or harassing
- Vulgar or profane
- Discriminatory or promoting harm
- Illegal or unethical

If asked to generate such content, politely refuse and redirect to placement/career topics.
Your purpose is placement preparation, coding interviews, resume building, and career growth ONLY.
`;

  return systemPrompt + safetyInstruction;
};
