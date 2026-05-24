import { OPENREPLAY_CONFIG } from "./config";

let startAt = 0;
let timeoutId = null;
let replayWindowOpen = false;

function now() {
  return Date.now();
}

function canStart() {
  const { minStartIntervalMs, maxConcurrentWindows } = OPENREPLAY_CONFIG.session;
  const current = replayWindowOpen ? 1 : 0;
  if (current >= maxConcurrentWindows) return false;
  return now() - startAt >= minStartIntervalMs;
}

export function getReplayState() {
  return {
    replayWindowOpen,
    startAt,
  };
}

export function closeReplayWindow({ reason } = {}) {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  replayWindowOpen = false;

  // Return reason for breadcrumbing
  return reason || "closed";
}

export function openReplayWindow({ startFn, stopFn, metadata = {}, stage, route } = {}) {
  try {
    if (!OPENREPLAY_CONFIG.session.enabled) return false;
    if (!canStart()) return false;
    if (replayWindowOpen) return false;

    replayWindowOpen = true;
    startAt = now();

    if (typeof startFn === "function") {
      startFn({ metadata, stage, route });
    }

    const { replayTimeoutMs } = OPENREPLAY_CONFIG.session;
    timeoutId = window.setTimeout(() => {
      try {
        if (typeof stopFn === "function") {
          stopFn({ reason: "timeout", stage, route });
        }
      } finally {
        closeReplayWindow({ reason: "timeout" });
      }
    }, replayTimeoutMs);

    return true;
  } catch {
    return false;
  }
}
