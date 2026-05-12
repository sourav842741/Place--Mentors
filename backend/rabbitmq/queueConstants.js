export const QUEUES = {
  // Centralized durable queues
  EMAIL: "email-queue",
  EMAIL_RETRY: "email-queue-retry",
  EMAIL_DLQ: "email-queue-dlq",

  // Future scalability hooks (reserved names)
  OTP: "otp-email-queue",
  OTP_RETRY: "otp-email-queue-retry",
  OTP_DLQ: "otp-email-queue-dlq",

  WELCOME: "welcome-email-queue",
  WELCOME_RETRY: "welcome-email-queue-retry",
  WELCOME_DLQ: "welcome-email-queue-dlq",

  NOTIFICATIONS: "notification-queue",
  NOTIFICATIONS_RETRY: "notification-queue-retry",
  NOTIFICATIONS_DLQ: "notification-queue-dlq",

  ANALYTICS: "analytics-queue",
  ANALYTICS_RETRY: "analytics-queue-retry",
  ANALYTICS_DLQ: "analytics-queue-dlq",
};

export const MAX_RETRIES = 3;
