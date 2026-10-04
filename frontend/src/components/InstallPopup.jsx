import { useEffect, useState } from "react";
import { installApp, canInstall } from "../lib/pwa";
import { Download, X } from "lucide-react";

export default function InstallPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const LAST_CLOSED_KEY = "install_popup_last_closed";
    const EIGHT_HOURS = 8 * 60 * 60 * 1000;

    const timer = setTimeout(() => {
      if (!canInstall()) return;

      const cookieConsent = localStorage.getItem("cookie_consent");
      if (!cookieConsent) return;

      const lastClosed = localStorage.getItem(LAST_CLOSED_KEY);
      const now = Date.now();

      if (lastClosed && now - Number(lastClosed) < EIGHT_HOURS) {
        return;
      }

      setShow(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    localStorage.setItem("install_popup_last_closed", Date.now());
    setShow(false);
  };

  const handleInstall = async () => {
    await installApp();
    localStorage.setItem("install_popup_last_closed", Date.now());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="w-84 rounded-2xl border border-border bg-surface p-5 shadow-card text-text transition-colors duration-200">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-text">
              Install PlaceMentor 🚀
            </h3>
          </div>

          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-text-subtle hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-text-muted leading-relaxed mb-4">
          Install the desktop/mobile app for faster practice, offline revision & instant notifications.
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
          >
            Maybe Later
          </button>

          <button
            onClick={handleInstall}
            className="rounded-xl bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-on-primary shadow-soft transition-all hover:scale-[1.02] cursor-pointer"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}
