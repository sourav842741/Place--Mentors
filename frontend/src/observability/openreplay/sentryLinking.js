import * as Sentry from "@sentry/react";

export function correlateWithSentry(tracker) {
  try {
    // Best-effort correlation: add Sentry context when available.
    // We do not attempt any Sentry SDK integration changes.

    const scope = Sentry.getCurrentScope?.();
    const ctx = scope?.getPropagationContext?.();

    const sentryTraceId = ctx?.traceId;
    const sentrySpanId = ctx?.spanId;

    if (typeof tracker?.setSessionContext === "function") {
      tracker.setSessionContext({
        sentry: {
          traceId: sentryTraceId || undefined,
          spanId: sentrySpanId || undefined,
        },
      });
      return;
    }

    if (typeof tracker?.setMetadata === "function") {
      tracker.setMetadata({
        sentryTraceId: sentryTraceId || undefined,
        sentrySpanId: sentrySpanId || undefined,
      });
    }
  } catch {
    // fail silently
  }
}
