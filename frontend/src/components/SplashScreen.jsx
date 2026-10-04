import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "./BrandLogo";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Exit after 900ms
    const exitTimer = setTimeout(() => setIsVisible(false), 900);

    // Navigate after 1200ms
    const navTimer = setTimeout(() => navigate("/dashboard"), 1200);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div
      className={`
      h-screen w-full flex flex-col items-center justify-center p-8
      overflow-hidden relative
      transition-all duration-500 ease-in-out
      bg-bg text-text
      ${isVisible ? "scale-100 opacity-100 blur-none" : "scale-105 opacity-0 blur-sm"}
    `}
    >
      {/* Glowing background circles with brand colors */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 -right-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Brand Presentation */}
      <div className="relative z-10 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
        <BrandLogo size="lg" />

        <div className="flex items-center gap-2 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          <span className="text-xs font-semibold text-text-subtle tracking-widest uppercase">
            Loading Platform...
          </span>
        </div>
      </div>
    </div>
  );
}
