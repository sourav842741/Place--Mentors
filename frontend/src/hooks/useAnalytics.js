import api from "../services/api";

const CONSENT_KEY = "cookie_consent";

const hasConsent = () => {
  try {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
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

export const trackEvent = async (eventType, metadata = {}) => {
  if (!hasConsent()) return;

  try {
    await api.post("/api/admin/track-event", {
      eventType,
      metadata,
    });
  } catch {
    // silently fail to not block UX
  }
};

export const useAnalytics = () => {
  return { trackEvent, hasConsent, detectDeviceType };
};

export default useAnalytics;
