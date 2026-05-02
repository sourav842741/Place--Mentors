import React, { useState, useEffect } from "react";

import { X, AlertCircle, Info, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

/* =========================
   ICON SELECTOR
========================= */
const getIconByType = (type) => {
  switch (type) {
    case "success":
      return CheckCircle;

    case "danger":
      return AlertCircle;

    case "warning":
      return AlertTriangle;

    default:
      return Info;
  }
};

export default function AnnouncementBar({ settings }) {
  const [isVisible, setIsVisible] = useState(true);

  const [mounted, setMounted] = useState(false);

  /* =========================
     SAME LOCAL STORAGE LOGIC
  ========================= */
  const storageKey = `announcement_closed_${settings?.announcementText || "default"}`;

  useEffect(() => {
    if (!settings) return;

    setMounted(true);

    const closed = localStorage.getItem(storageKey);

    setIsVisible(!closed);
  }, [settings, storageKey]);

  const handleClose = () => {
    localStorage.setItem(storageKey, "true");

    setIsVisible(false);
  };

  /* =========================
     CONDITIONS
  ========================= */
  if (!mounted || !isVisible || !settings) return null;

  if (!settings?.announcementEnabled) return null;

  if (!settings?.announcementText?.trim()) return null;

  /* =========================
     STYLE MAP
  ========================= */
  const type = settings?.announcementType || "info";

  const Icon = getIconByType(type);

  const bgClass = {
    info: "from-blue-600 via-indigo-600 to-purple-600",
    success: "from-emerald-500 via-green-600 to-teal-600",
    warning: "from-yellow-500 via-orange-500 to-red-500",
    danger: "from-rose-500 via-red-600 to-pink-600",
  }[type];

  /* =========================
     UI
  ========================= */
  return (
    <div
      className={`relative overflow-hidden w-full bg-gradient-to-r ${bgClass} text-white shadow-2xl border-b border-white/10`}
    >
      {/* Glow Layer */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

      {/* Floating Effect */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-4 flex-wrap">
        {/* ICON */}
        <div className="shrink-0 w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shadow-lg">
          <Icon className="w-5 h-5" />
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          {settings?.announcementImage && (
            <img
              src={settings.announcementImage}
              alt="Announcement"
              className="w-14 h-14 rounded-2xl object-cover border border-white/20 shadow-xl"
            />
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles className="w-4 h-4 text-yellow-200" />

              <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/80">
                Announcement
              </span>
            </div>

            <p className="font-semibold text-sm sm:text-base leading-5 break-words text-white">
              {settings.announcementText}
            </p>
          </div>
        </div>

        {/* CTA BUTTON */}
        {settings?.announcementButtonText && settings?.announcementButtonLink && (
          <a
            href={settings.announcementButtonLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all duration-200 hover:scale-105 whitespace-nowrap"
          >
            {settings.announcementButtonText}
          </a>
        )}

        {/* CLOSE */}
        {/* CLOSE BUTTON ko sirf replace karo */}

        {settings?.announcementClosable && (
          <button
            onClick={handleClose}
            aria-label="Close announcement"
            className="
      shrink-0
      h-10 w-10
      rounded-2xl
      bg-white/12
      border border-white/20
      backdrop-blur-md
      flex items-center justify-center
      text-white/90
      shadow-lg
      transition-all duration-200
      hover:bg-white hover:text-gray-900
      hover:scale-105
      active:scale-95
      group
    "
          >
            <X className="w-4.5 h-4.5 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
          </button>
        )}
      </div>
    </div>
  );
}
