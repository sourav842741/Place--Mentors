import * as Sentry from "@sentry/node";

let initialized = false;

const initSentry = () => {
  if (initialized) return;

  initialized = true;

  const dsn = process.env.SENTRY_DSN;

  if (!dsn) return;

  try {
    const isTest = process.env.NODE_ENV === "test";

    Sentry.init({
      dsn,

      environment: process.env.NODE_ENV || "production",

      // Performance tracing
      tracesSampleRate: isTest ? 0 : 0.1,

      // Disable noisy SDK debug logs
      debug: false,

      // Capture console logs
      integrations: [
        Sentry.consoleLoggingIntegration({
          levels: ["log", "warn", "error"],
        }),
      ],

      // Enable logs in Sentry Explore -> Logs
      enableLogs: true,
    });
  } catch (e) {
    // Never crash app if Sentry fails
    console.error("Sentry init failed:", e.message);
  }
};

export { initSentry, Sentry };
