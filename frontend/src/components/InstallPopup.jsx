import { useEffect, useState } from "react";
import { installApp, canInstall } from "../lib/pwa";

export default function InstallPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const LAST_CLOSED_KEY = "install_popup_last_closed";
    const EIGHT_HOURS = 8 * 60 * 60 * 1000;

    const timer = setTimeout(() => {
      if (!canInstall()) return;

      // Cookie popup active hai toh install popup mat dikhao
      const cookieConsent = localStorage.getItem("cookie_consent");
      if (!cookieConsent) return;

      const lastClosed = localStorage.getItem(LAST_CLOSED_KEY);
      const now = Date.now();

      // Agar user ne 8 ghante ke andar close kiya tha
      if (lastClosed && now - Number(lastClosed) < EIGHT_HOURS) {
        return;
      }

      setShow(true);
    }, 3000); // page load ke 3 sec baad check

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
      <div className="w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Title */}
        <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
          Install Place Mentor 🚀
        </h3>

        {/* Subtitle */}
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Unlock premium tools, faster access & exclusive features.
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-sm text-gray-500 transition hover:text-black dark:hover:text-white"
          >
            Later
          </button>

          <button
            onClick={handleInstall}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white transition hover:bg-blue-700"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
