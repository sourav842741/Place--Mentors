import { OPENREPLAY_CONFIG } from "./config";

export function applyDomMasking(tracker) {
  try {
    if (!tracker || !OPENREPLAY_CONFIG.privacy.redactTextInputs) return;

    // Best-effort: most stable SDKs support masking by passing mask selectors.
    // If unsupported by current tracker version, this no-ops.
    const selectors = [
      "input[type='password']",
      "input[name*='otp' i]",
      "input[id*='otp' i]",
      "input[name*='token' i]",
      "input[id*='token' i]",
      "textarea",
      "input[name*='email' i]",
      "input[name*='fullName' i]",
      "input[name*='resume' i]",
    ];

    const any =
      typeof tracker?.mask === "function"
        ? tracker.mask
        : typeof tracker?.setMask === "function"
          ? tracker.setMask
          : null;

    if (!any) return;

    any.call(tracker, {
      selectors,
      // redact content rather than masking pixels only
      redactText: true,
    });
  } catch {
    // fail silently
  }
}
