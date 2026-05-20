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

      // Production-safe defaults
      tracesSampleRate: isTest ? 0 : 0.1,

      // Avoid noisy logs.
      debug: false,
    });
  } catch (e) {
    // Never crash the app if Sentry fails.
  }
};

export { initSentry, Sentry };


