/**
 * Sanitize HTML content to prevent XSS in PDF/Email generation.
 * Lightweight alternative to full DOMPurify for backend use.
 */
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Sanitize string for safe CSV output (prevent formula injection).
 */
export const sanitizeCsvField = (value) => {
  if (value == null) return "";
  const str = String(value);
  // Prefix dangerous characters used for CSV formula injection
  if (/^[\+\-\=\@\t\r\n]/.test(str)) {
    return "'" + str;
  }
  return str;
};

/**
 * Strip sensitive keys from logged objects.
 */
export const redactSensitive = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  const sensitiveKeys = [
    "password",
    "token",
    "secret",
    "apiKey",
    "api_key",
    "accessToken",
    "refreshToken",
    "googleCalendarAccessToken",
    "googleCalendarRefreshToken",
    "twoFactorSecret",
    "twoFactorTempSecret",
    "twoFactorRecoveryCodes",
    "trustedDevices",
    "resetOtp",
    "verifyOtp",
    "otp",
  ];
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(clone)) {
    if (sensitiveKeys.includes(key)) {
      clone[key] = "[REDACTED]";
    } else if (typeof clone[key] === "object" && clone[key] !== null) {
      clone[key] = redactSensitive(clone[key]);
    }
  }
  return clone;
};
