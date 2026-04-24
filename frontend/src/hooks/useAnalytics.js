import api from "../services/api";

const CONSENT_KEY = "cookie_consent";
const QUEUE_KEY = "analytics_queue";

const hasConsent = () => {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;

    if (raw === "accepted") return true;

    const parsed = JSON.parse(raw);
    return parsed?.status === "accepted" && parsed?.expiresAt > Date.now();
  } catch {
    return false;
  }
};

const detectDeviceType = () => {
  const ua = navigator.userAgent;

  if (/mobile|android|iphone|ipod/i.test(ua)) return "mobile";
  if (/ipad|tablet/i.test(ua)) return "tablet";

  return "desktop";
};

const flushQueue = async () => {
  try {
    const queue = JSON.parse(
      localStorage.getItem(QUEUE_KEY) || "[]"
    );

    if (!queue.length) return;

    const res = await api.post(
      "/api/admin/track-events-batch",
      { events: queue }
    );

    if (res.data?.data?.count > 0) {
      localStorage.removeItem(QUEUE_KEY);
    }
  } catch {
    // silent fail
  }
};

export const trackEvent = async (
  eventType,
  metadata = {}
) => {
  const consent = hasConsent();

  if (!consent) return;

  const payload = {
    eventType,
    metadata: {
      ...metadata,
      deviceType: detectDeviceType(),
    },
  };

  try {
    await api.post(
      "/api/admin/track-event",
      payload
    );
  } catch {
    const queue = JSON.parse(
      localStorage.getItem(QUEUE_KEY) || "[]"
    );

    queue.push({
      ...payload,
      timestamp: Date.now(),
      deviceType: detectDeviceType(),
    });

    localStorage.setItem(
      QUEUE_KEY,
      JSON.stringify(queue.slice(-50))
    );
  }
};

// Flush on load and online
if (typeof window !== "undefined") {
  window.addEventListener("online", flushQueue);
  flushQueue();
}

export const useAnalytics = () => {
  return {
    trackEvent,
    hasConsent,
    detectDeviceType,
  };
};

export default useAnalytics;