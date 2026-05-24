import Tracker from "@openreplay/tracker";
import { OPENREPLAY_CONFIG } from "./config";
import { applyDomMasking } from "./masking";
import { correlateWithSentry } from "./sentryLinking";

let tracker = null;
let initialized = false;

// only show logs in local development
const IS_DEV = import.meta.env.DEV;

function debugLog(...args) {
  if (IS_DEV) {
    console.log(...args);
  }
}

function debugError(...args) {
  if (IS_DEV) {
    console.error(...args);
  }
}

function getDeviceType() {
  try {
    const ua = navigator.userAgent;

    if (/tablet|ipad/i.test(ua)) {
      return "tablet";
    }

    if (/mobi|android|iphone/i.test(ua)) {
      return "mobile";
    }

    return "desktop";
  } catch {
    return "unknown";
  }
}

function safeTrackerInit() {
  try {
    if (initialized) return tracker;

    initialized = true;

    const projectKey = OPENREPLAY_CONFIG.projectKey;

    if (!projectKey) {
      debugError("❌ OpenReplay projectKey missing");
      return null;
    }

    tracker = new Tracker({
      projectKey,

      ingestPoint: "https://api.openreplay.com/ingest",

      // localhost support
      __DISABLE_SECURE_MODE: true,
    });

    // start tracker
    tracker.start();

    debugLog("✅ OpenReplay Started");

    // session/device metadata
    try {
      const ua = navigator.userAgent;

      tracker.setMetadata?.({
        platform: navigator.platform,
        language: navigator.language,
        deviceType: getDeviceType(),
        userAgent: ua,

        isAndroid: /android/i.test(ua),
        isIOS: /iphone|ipad|ipod/i.test(ua),

        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,

        timezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone,

        route: window.location.pathname,
      });
    } catch {
      // fail silently
    }

    // integrations
    applyDomMasking(tracker);
    correlateWithSentry(tracker);

    // expose globally for debugging
    if (typeof window !== "undefined") {
      window.__OPENREPLAY__ = {
        tracker,
      };
    }

    return tracker;
  } catch (error) {
    debugError("❌ OpenReplay init failed", error);
    return null;
  }
}

export function getTracker() {
  if (!tracker && !initialized) {
    safeTrackerInit();
  }

  return tracker;
}

export function safeTrackEvent(name, payload) {
  const t = getTracker();

  if (!t) return;

  try {
    // OpenReplay v18 custom events
    if (typeof t.event === "function") {
      t.event(name, payload);
    }

    debugLog("📡 OpenReplay Event:", name, payload);
  } catch (error) {
    debugError("❌ OpenReplay track failed", error);
  }
}

export function safeSetUser(user) {
  const t = getTracker();

  if (!t || !user) return;

  try {
    const userId =
      user?.fullName ||
      user?.username ||
      user?.email ||
      user?.id ||
      user?._id ||
      "anonymous-user";

    // session visible name
   if (typeof t.setUserID === "function") {
  t.setUserID(String(userId));
} else if (typeof t.setUser === "function") {
  t.setUser(String(userId));
}

    // metadata
    if (typeof t.setMetadata === "function") {
      t.setMetadata({
        userId: user?._id || user?.id,
        fullName: user?.fullName,
        username: user?.username,
        email: user?.email,
        role: user?.role,

        isAdmin:
          user?.role === "admin" ||
          user?.role === "superadmin",
      });
    }

    debugLog("✅ OpenReplay User Set:", userId);
  } catch (error) {
    debugError("❌ OpenReplay setUser failed", error);
  }
}

export function safeSetSessionMetadata(metadata) {
  const t = getTracker();

  if (!t) return;

  try {
    if (typeof t.setSessionContext === "function") {
      t.setSessionContext(metadata);
      return;
    }

    if (typeof t.setMetadata === "function") {
      t.setMetadata(metadata);
    }
  } catch (error) {
    debugError("❌ OpenReplay metadata failed", error);
  }
}

export function safeStartReplayWindow() {
  const t = getTracker();

  if (!t) return false;

  try {
    if (typeof t.startReplay === "function") {
      t.startReplay();
      return true;
    }

    if (typeof t.startRecording === "function") {
      t.startRecording();
      return true;
    }

    if (typeof t.replay === "function") {
      t.replay();
      return true;
    }
  } catch (error) {
    debugError("❌ OpenReplay replay start failed", error);
  }

  return false;
}

export function safeStopReplayWindow() {
  const t = getTracker();

  if (!t) return false;

  try {
    if (typeof t.stopReplay === "function") {
      t.stopReplay();
      return true;
    }

    if (typeof t.stopRecording === "function") {
      t.stopRecording();
      return true;
    }
  } catch (error) {
    debugError("❌ OpenReplay replay stop failed", error);
  }

  return false;
}