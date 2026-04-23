import { useEffect, useState } from "react";
import { installApp, canInstall } from "../lib/pwa";

export default function InstallPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const LAST_CLOSED_KEY = "install_popup_last_closed";
    const FOUR_HOURS = 4 * 60 * 60 * 1000;

    const timer = setTimeout(() => {
      if (!canInstall()) return;

      const lastClosed = localStorage.getItem(LAST_CLOSED_KEY);
      const now = Date.now();

      // Agar pehle close kiya tha aur 4 hours complete nahi hua
      if (lastClosed && now - Number(lastClosed) < FOUR_HOURS) {
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
      <div className="bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl p-4 w-80">

        {/* Title */}
        <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
          Install Place Mentor 🚀
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Unlock premium tools, faster access & exclusive features.
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-black dark:hover:text-white transition"
          >
            Later
          </button>

          <button
            onClick={handleInstall}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}