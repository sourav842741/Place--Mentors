import { sanitizeEventPayload } from "./sanitize";
import { safeTrackEvent, safeSetUser, safeSetSessionMetadata, getTracker } from "./openReplay";
import { startReplayOnEvent, startReplayOnStage, stopReplayOnSuccess } from "./triggers";
import { getReplayRouteKey } from "./routeStrategy";

export function safeTrack(name, payload = {}) {
  try {
    const t = getTracker();
    if (!t) return;

    const routePath = typeof window !== "undefined" ? window.location.pathname : "";
    const routeKey = getReplayRouteKey(routePath);

    const safePayload = sanitizeEventPayload(payload);

    safeSetSessionMetadata({ routePath, routeKey });
    safeTrackEvent(name, { ...safePayload, routeKey });

    // start replay if this event is critical
    startReplayOnEvent({ eventName: name, metadata: safePayload, routePath });
  } catch {
    // fail silently
  }
}

export function safeSetUserFromState(user) {
  try {
    if (!user) return;
    // never send sensitive fields
    const safe = {
      id: user._id || user.id || undefined,
      role: user.role || undefined,
      isAdmin: user.role === "admin" || user.role === "superadmin" || undefined,
    };
    safeSetUser(safe);

    safeSetSessionMetadata({
      isAuthenticated: true,
      role: safe.role,
    });
  } catch {
    // fail silently
  }
}

export function startCriticalReplay(stage, metadata = {}) {
  try {
    const routePath = typeof window !== "undefined" ? window.location.pathname : "";
    startReplayOnStage({ stage, metadata, routePath });
  } catch {
    // fail silently
  }
}

export function stopReplaySuccess(stage) {
  try {
    stopReplayOnSuccess({ stage });
  } catch {
    // fail silently
  }
}
