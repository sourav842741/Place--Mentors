import React from "react";
import { GraduationCap } from "lucide-react";

export default function BrandLogo({
  size = "default",
  showSubtitle = true,
  showBadge = true,
  className = "",
}) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* Sleek Gradient Emblem */}
      <div
        className={`relative ${
          isSm
            ? "w-8 h-8 rounded-lg"
            : isLg
            ? "w-11 h-11 rounded-2xl"
            : "w-9 h-9 sm:w-10 sm:h-10 rounded-xl"
        } bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-[1.5px] shadow-sm shadow-emerald-600/25 group-hover:shadow-md group-hover:shadow-emerald-600/35 group-hover:scale-105 transition-all duration-300 shrink-0`}
      >
        <div className="w-full h-full rounded-[inherit] bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center text-white relative overflow-hidden">
          {/* Ambient sheen reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/25 to-transparent pointer-events-none" />

          {/* Graduation Cap with dynamic tilt on hover */}
          <GraduationCap
            className={`${
              isSm ? "w-4 h-4" : isLg ? "w-6 h-6" : "w-5 h-5"
            } text-white drop-shadow-sm transition-transform duration-300 group-hover:-rotate-6`}
          />

          {/* Golden pulse beacon accent */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 ring-2 ring-emerald-700 animate-pulse" />
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight text-text leading-tight transition-colors group-hover:text-text/90 ${
              isSm ? "text-base" : isLg ? "text-2xl" : "text-lg sm:text-xl"
            }`}
          >
            Place
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-300 bg-clip-text text-transparent font-black ml-0.5">
              Mentor
            </span>
          </span>

          {showBadge && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              AI
            </span>
          )}
        </div>

        {showSubtitle && (
          <span className="text-[9.5px] font-semibold tracking-wider uppercase text-text-subtle leading-none mt-0.5 hidden sm:block">
            Career & Placement
          </span>
        )}
      </div>
    </div>
  );
}
