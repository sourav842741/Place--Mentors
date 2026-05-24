export const OPENREPLAY_CONFIG = {
  // Required env vars
  projectKey: import.meta.env.VITE_OPENREPLAY_PROJECT_KEY,

  session: {
    enabled: true,
    // baseline sampling for event/breadcrumb capture; session replay is trigger-based only
    baseTrackSampleRate: 0.02,

    // replay window control (best-effort). If tracker does not support replay start/stop,
    // we still keep the integration safe and only track events.
    replayTimeoutMs: 45_000,
    minStartIntervalMs: 12_000,
    maxConcurrentWindows: 1,
  },

  routing: {
    enabled: true,
    // allow-list for starting a replay window on navigation triggers
    // (we keep this list small to avoid noisy captures)
    replayRouteAllowList: new Set([
      "/login",
      "/verify-otp",
      "/forgot-password",
      "/reset-password",
      "/resume-analyzer",
      "/resume-generator",
      "/payments",
      "/doubts",
      "/support",
      "/support/ticket",
      "/admin/dashboard",
      "/admin/users",
      "/admin/email-center",
      "/admin/maintenance-manager",
      "/admin/tickets",
      "/admin/payments",
    ]),
  },

  privacy: {
    // selector-level best-effort masking; for tracker versions without DOM masking,
    // this will no-op.
    redactTextInputs: true,
    // hard-block event payload keys
    forbiddenEventKeys: new Set([
      "password",
      "otp",
      "token",
      "recovery",
      "newPassword",
      "email",
      "resume",
      "resumeText",
      "question",
      "reply",
      "fullName",
      "avatar",
      "coverImage",
    ]),
  },

  replayTriggers: {
    // When these event types are emitted, we start a replay window (best-effort)
    criticalEvents: new Set([
      "login_failed",
      "google_auth_failed",
      "2fa_required",
      "2fa_verify_failed",
      "protected_redirect_loop",
      "resume_analyzer_upload_failed",
      "payments_list_load_failed",
      "payment_report_issue_clicked",
      "protected_redirect",
    ]),

    // Additionally, we start replay on explicit stages.
    replayStages: new Set([
      "auth_login",
      "auth_google",
      "auth_2fa",
      "auth_2fa_failed",
      "auth_google_failed",
      "resume_analyzer",
      "resume_analyzer_failed",
      "payments",
      "payment_failed",
      "protected_redirect_loop",
    ]),
  },
};
