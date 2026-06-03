import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,

  integrations: [
    Sentry.browserTracingIntegration(),

    Sentry.replayIntegration(),

    Sentry.consoleLoggingIntegration({
      levels: ["log", "warn", "error"],
    }),
  ],

  // Performance monitoring
  tracesSampleRate: 1.0,

  // Session replay sampling
  replaysSessionSampleRate: 0.1,

  // Record full session when error occurs
  replaysOnErrorSampleRate: 1.0,

  // Enable frontend logs
  enableLogs: true,
});

export default Sentry;
