export const buildEmailPayload = ({
  to,
  subject,
  html,
  meta = {},
  retryCount = 0,
  maxRetries = meta?.maxRetries,
  jobType = meta?.jobType || "email",
}) => {
  if (!to || typeof to !== "string") throw new Error("buildEmailPayload: 'to' required");
  if (!subject || typeof subject !== "string")
    throw new Error("buildEmailPayload: 'subject' required");
  if (!html || typeof html !== "string") throw new Error("buildEmailPayload: 'html' required");

  return {
    to,
    subject,
    html,

    meta,
    retryCount,
    maxRetries: maxRetries ?? meta?.maxRetries ?? 3,
    jobType,
  };
};
