import { useEffect, useState } from "react";
import { installApp, canInstall } from "../lib/pwa";

export default function InstallPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (canInstall()) {
        setShow(true);
      }
    }, 3000); // 3 sec baad show

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-white shadow-2xl border rounded-2xl p-4 w-80">
        
        {/* Title */}
        <h3 className="font-semibold text-lg mb-1">
          Install Place Mentor 🚀
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 mb-4">
          Get faster access & offline features!
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShow(false)}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-black"
          >
            Later
          </button>

          <button
            onClick={() => {
              installApp();
              setShow(false);
            }}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}