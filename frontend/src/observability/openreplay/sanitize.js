import { OPENREPLAY_CONFIG } from "./config";

const redactValue = () => "[REDACTED]";

export function sanitizeEventPayload(payload) {
  try {
    const forbidden = OPENREPLAY_CONFIG.privacy.forbiddenEventKeys;
    const next = {};

    for (const [k, v] of Object.entries(payload || {})) {
      if (forbidden.has(k)) continue;

      if (typeof v === "string") {
        // Avoid logging long free-form text
        if (v.length > 200) {
          next[k] = "[TRUNCATED]";
          continue;
        }
        // avoid token-like strings
        if (/(otp|token|bearer|secret|password)/i.test(k) || /\b([A-Za-z0-9_-]{20,})\b/.test(v)) {
          next[k] = redactValue();
          continue;
        }
      }

      next[k] = v;
    }

    return next;
  } catch {
    return {};
  }
}
