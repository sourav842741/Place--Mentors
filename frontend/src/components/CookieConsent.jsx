import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check } from "lucide-react";
import api from "../services/api";

const CONSENT_KEY = "cookie_consent";

/* Helpers */
const getStoredConsent = () => {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setStoredConsent = (status, days) => {
  try {
    const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;

    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        status,
        expiresAt,
      })
    );
  } catch {
    // ignore
  }
};

export const hasCookieConsent = () => {
  const consent = getStoredConsent();
  return consent && consent.status === "accepted" && consent.expiresAt > Date.now();
};

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();

    if (!consent || consent.expiresAt < Date.now()) {
      localStorage.removeItem(CONSENT_KEY);
      setVisible(true);
    }
  }, []);

  const sendEvent = async (eventType) => {
    try {
      await api.post("/api/admin/track-event", {
        eventType,
        metadata: {},
      });
    } catch {}
  };

  const handleAccept = async () => {
    setStoredConsent("accepted", 8); // 8 days
    setVisible(false);
    await sendEvent("cookie_accept");
  };

  const handleReject = async () => {
    setStoredConsent("rejected", 3); // 3 days
    setVisible(false);
    await sendEvent("cookie_reject");
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 28,
          }}
          className="fixed bottom-5 left-4 right-4 z-[9999] mx-auto max-w-2xl"
        >
          <div className="rounded-2xl border border-border bg-surface/95 p-5 shadow-card backdrop-blur-xl text-text transition-colors duration-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary shadow-soft">
                <Cookie className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-text">
                  We value your privacy
                </h3>

                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-text-muted">
                  We use cookies to enhance your placement prep experience, analyze learning analytics, and improve our services.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleAccept}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 text-xs sm:text-sm font-semibold text-on-primary shadow-soft transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    Accept All
                  </button>

                  <button
                    onClick={handleReject}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 hover:bg-surface px-5 py-2.5 text-xs sm:text-sm font-medium text-text transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
